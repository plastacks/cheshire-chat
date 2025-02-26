import * as React from "react";
import { CatClient, SocketError } from "ccat-api";
import { toast } from "sonner";
import { ChatMessage, ChatMessagesRef } from "@/components/chat";
import { useNavigate } from "@tanstack/react-router";
import { getAuthToken, logout as serverLogout } from "@/lib/auth";

/**
 * ! THIS CODE IS IN DEVELOPMENT
 * TODO: Add multiple chats support
 */

export type Chat = {
  id: string;
  name: string;
};

export type ChatContextType = {
  error: SocketError | null;
  ready: boolean;
  chats: Chat[];
  handleCreateChat: (name: string) => void;
  handleDeleteChat: (id: string) => void;
  messages: ChatMessage[];
  isResponding: boolean;
  messagesRef: React.RefObject<(HTMLDivElement & ChatMessagesRef) | null>;
  allowedMimetypes: string[];
  handlePromptSubmit: (prompt: string) => void;
  handleClearConversation: () => Promise<void>;
  handleIngestUrl: (url: string) => void;
  handleIngestFile: (file: File) => void;
  handleChangeChatId: (newId: string) => void;
  logout: () => void;
};

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

const token = await getAuthToken();

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<SocketError | null>(null);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [allowedMimetypes, setAllowedMimetypes] = React.useState<string[]>([]);
  const messagesRef = React.useRef<(HTMLDivElement & ChatMessagesRef) | null>(
    null
  );
  const [isResponding, setIsResponding] = React.useState(false);

  const logout = React.useCallback(async () => {
    try {
      await serverLogout();

      if (window.catClient) {
        window.catClient.close();
        window.catClient = undefined;
      }

      navigate({ to: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      navigate({ to: "/" });
    }
  }, [navigate]);

  const fetchAllowedMimetypes = React.useCallback(async () => {
    try {
      const response =
        await window.catClient?.api?.rabbitHole.getAllowedMimetypes();
      if (response?.allowed) {
        setAllowedMimetypes(response.allowed);
      }
    } catch (error) {
      console.error("Error fetching allowed mimetypes:", error);
    }
  }, []);

  const loadChatHistory = React.useCallback(async () => {
    try {
      console.log(
        "Loading conversation history",
        await window.catClient?.api?.memory.getConversationHistory()
      );
      const chatHistory =
        await window.catClient?.api?.memory.getConversationHistory();
      if (chatHistory) {
        setMessages(
          chatHistory.history.map((conversationMessage) => ({
            role: conversationMessage.who === "AI" ? "assistant" : "user",
            content: conversationMessage.message,
          }))
        );
      }
      await fetchAllowedMimetypes();

      setReady(true);
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast.error("Failed to load conversation history");
    }
  }, [fetchAllowedMimetypes]);

  React.useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    if (!window.catClient) {
      const catClient = new CatClient({
        host: "localhost",
        credential: token,
        secure: window.location.protocol === "https:",
      });

      window.catClient = catClient;
    }

    window.catClient
      .onConnected(() => {
        console.log("Connected to Cheshire Cat backend");
        loadChatHistory();
      })
      .onMessage((data) => {
        switch (data.type) {
          case "chat_token":
            if (typeof data.content === "string") {
              setIsResponding(true);
              setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (
                  lastMessage &&
                  lastMessage.role === "assistant" &&
                  lastMessage.streaming
                ) {
                  return [
                    ...prevMessages.slice(0, -1),
                    {
                      ...lastMessage,
                      content: lastMessage.content + data.content,
                    },
                  ];
                }
                return [
                  ...prevMessages,
                  {
                    role: "assistant",
                    content: data.content,
                    streaming: true,
                  },
                ];
              });
            }
            break;
          case "chat":
            if (typeof data.text === "string") {
              setIsResponding(false);
              setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage && lastMessage.streaming) {
                  return [
                    ...prevMessages.slice(0, -1),
                    {
                      role: "assistant",
                      content: data.text!,
                      streaming: false,
                    },
                  ];
                }
                return [
                  ...prevMessages,
                  {
                    role: "assistant",
                    content: data.text!,
                    streaming: false,
                  },
                ];
              });
            }
            break;
          default:
            break;
        }
      })
      .onError((error) => {
        console.error("Cheshire Cat connection error:", error);
        toast.error("Connection error with Cheshire Cat");
        setChats([]);
        setMessages([]);
        setError(error);
        if (
          error.description.includes("401") ||
          error.description.includes("403")
        ) {
          logout();
        }
      });

    return () => {
      window.catClient?.close();
    };
  }, [loadChatHistory, logout]);

  const handleCreateChat = React.useCallback(async (name: string) => {}, []);

  const handleDeleteChat = React.useCallback(async (id: string) => {}, []);

  const handleIngestUrl = React.useCallback((url: string) => {
    window.catClient?.api?.rabbitHole
      .uploadUrl({ url })
      .then((response) => {
        console.log("URL ingestion response:", response);
        toast.success(`Successfully ingested URL: ${url}`);
      })
      .catch((error) => {
        console.error("Error ingesting URL:", error);
        toast.error(`Failed to ingest URL: ${url}`);
      });
  }, []);

  const handleIngestFile = React.useCallback((file: File) => {
    window.catClient?.api?.rabbitHole
      .uploadFile({
        file,
      })
      .then((response) => {
        console.log("File ingestion response:", response);
        toast.success(`Successfully ingested file: ${file.name}`);
      })
      .catch((error) => {
        console.error("Error ingesting file:", error);
        toast.error(`Failed to ingest file: ${file.name}`);
      });
  }, []);

  const handlePromptSubmit = React.useCallback((prompt: string) => {
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    window.catClient?.send({ text: prompt });
    messagesRef.current?.scrollToBottom();
  }, []);

  const handleChangeChatId = React.useCallback((newChatId: string) => {}, []);

  const handleClearConversation = React.useCallback(async () => {
    await window.catClient?.api?.memory
      .wipeConversationHistory()
      .then(() => {
        setMessages([]);
      })
      .catch((error) => {
        console.error("Error clearing conversation:", error);
        toast.error("Failed to clear conversation");
      });
  }, []);

  const value = {
    ready,
    messages,
    isResponding,
    messagesRef,
    allowedMimetypes,
    handlePromptSubmit,
    handleClearConversation,
    handleIngestUrl,
    handleIngestFile,
    handleChangeChatId,
    chats,
    handleCreateChat,
    handleDeleteChat,
    error,
    logout,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

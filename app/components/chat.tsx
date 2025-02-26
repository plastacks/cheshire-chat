import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, SendHorizonal, Trash, Upload, Ellipsis } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChat } from "@/lib/ChatContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface ChatPromptInputProps extends React.ComponentProps<"div"> {
  onPromptSubmit?: (prompt: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onClearConversation?: () => void;
  onIngestUrl?: (url: string) => void;
  onIngestFile?: (file: File) => void;
  allowedMimetypes?: string[];
}

const extensions = (placeholder?: string) => [
  StarterKit,
  Placeholder.configure({
    placeholder: placeholder,
    emptyNodeClass:
      "first:before:h-0 first:before:text-muted-foreground first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none",
  }),
];

export function ChatPromptInput({
  onPromptSubmit,
  placeholder,
  disabled,
  onClearConversation,
  onIngestUrl,
  onIngestFile,
  allowedMimetypes = [],
  ...props
}: ChatPromptInputProps) {
  const promptRef = React.useRef<string>("");

  const [isUrlDialogOpen, setUrlDialogOpen] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const [isFileDialogOpen, setFileDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const editor = useEditor({
    extensions: extensions(placeholder),
    autofocus: true,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      promptRef.current = editor.getText();
    },
  });

  const acceptedFileTypes =
    allowedMimetypes.length > 0 ? allowedMimetypes.join(",") : undefined;

  return (
    <Card
      {...props}
      className={cn(
        "rounded-[calc(var(--spacing)*4.5+var(--spacing)*2)] py-0 gap-0 shadow-md",
        { "pointer-events-none": disabled },
        props.className
      )}
    >
      <CardContent className="max-h-32 min-h-16 p-0 m-4 mb-0 overflow-y-auto scrollbar-thin">
        <EditorContent
          editor={editor}
          className="[&>.ProseMirror]:focus:outline-none [&>.ProseMirror]:min-h-16"
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <div className="sm:hidden">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="rounded-full"
                      variant="outline"
                      size="icon"
                      disabled={disabled}
                    >
                      <Ellipsis />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start">
                {onClearConversation && (
                  <DropdownMenuItem
                    onClick={() => {
                      onClearConversation();
                      toast.success("Conversation cleared");
                    }}
                    disabled={disabled}
                  >
                    <Trash />
                    Clear Conversation
                  </DropdownMenuItem>
                )}
                {onIngestUrl && (
                  <DropdownMenuItem
                    onClick={() => setUrlDialogOpen(true)}
                    disabled={disabled}
                  >
                    <Link />
                    Ingest URL
                  </DropdownMenuItem>
                )}
                {onIngestFile && (
                  <DropdownMenuItem
                    onClick={() => setFileDialogOpen(true)}
                    disabled={disabled}
                  >
                    <Upload />
                    Ingest File
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-2">
            {onClearConversation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-full"
                    variant="outline"
                    onClick={() => {
                      onClearConversation();
                      toast.success("Conversation cleared");
                    }}
                    disabled={disabled}
                  >
                    <Trash />
                    Clear Conversation
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear the current conversation</TooltipContent>
              </Tooltip>
            )}
            {onIngestUrl && (
              <Dialog open={isUrlDialogOpen} onOpenChange={setUrlDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        className="rounded-full"
                        variant="outline"
                        disabled={disabled}
                      >
                        <Link />
                        Ingest URL
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Add context from a URL</TooltipContent>
                </Tooltip>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ingest URL</DialogTitle>
                    <DialogDescription>
                      Enter the URL to ingest content
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter URL"
                  />
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (urlInput.trim() !== "") {
                          onIngestUrl(urlInput);
                          setUrlDialogOpen(false);
                          setUrlInput("");
                        } else {
                          toast.error("Please enter a valid URL");
                        }
                      }}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUrlDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {onIngestFile && (
              <Dialog open={isFileDialogOpen} onOpenChange={setFileDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        className="rounded-full"
                        variant="outline"
                        disabled={disabled}
                      >
                        <Upload />
                        Ingest File
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Upload and add context from a file
                  </TooltipContent>
                </Tooltip>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ingest File</DialogTitle>
                    <DialogDescription>
                      Select a file to ingest content
                      {allowedMimetypes.length > 0 && (
                        <span className="mt-2 block text-xs text-muted-foreground">
                          Allowed file types: {allowedMimetypes.join(", ")}
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (selectedFile) {
                          onIngestFile(selectedFile);
                          setFileDialogOpen(false);
                          setSelectedFile(null);
                        } else {
                          toast.error("Please select a file");
                        }
                      }}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFileDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Send message"
              size="icon"
              className={cn("rounded-full")}
              disabled={disabled}
              onClick={() => {
                if (promptRef.current) {
                  console.log("Sending message", promptRef.current);
                  onPromptSubmit?.(promptRef.current);
                  editor?.commands.blur();
                  editor?.commands.clearContent();
                  promptRef.current = "";
                } else {
                  toast.error("Please enter a message");
                }
              }}
            >
              <SendHorizonal />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send message</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  streaming?: boolean;
};

export interface ChatMessagesProps extends React.ComponentProps<"div"> {
  messages: ChatMessage[];
}

export interface ChatMessagesRef {
  scrollToBottom: () => void;
}

export function ChatMessages({
  messages,
  className,
  ref,
  ...props
}: ChatMessagesProps & { ref?: React.Ref<HTMLDivElement & ChatMessagesRef> }) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => ({
    ...messagesEndRef.current!,
    scrollToBottom: () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  }));

  return (
    <div
      {...props}
      data-slot="chat-view"
      className={cn("flex flex-col gap-4", className)}
    >
      {messages.map((message, index) => (
        <div
          key={index}
          data-slot="chat-message"
          className={cn("px-2", {
            "bg-accent text-accent-foreground w-full sm:w-fit self-end rounded-md py-2 break-words":
              message.role === "user",
          })}
        >
          {message.content}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export function ChatView() {
  const {
    ready,
    messages,
    isResponding,
    messagesRef,
    allowedMimetypes,
    handlePromptSubmit,
    handleClearConversation,
    handleIngestUrl,
    handleIngestFile,
  } = useChat();

  return (
    <div className="flex flex-col h-full gap-36 max-w-[calc(65ch+var(--spacing)*4)] mx-auto">
      <ChatMessages
        messages={messages}
        ref={messagesRef}
        className={cn("h-0 transition-all duration-300", {
          "h-full": messages.length,
        })}
      />
      <div className="sticky bottom-0">
        <ChatPromptInput
          onPromptSubmit={handlePromptSubmit}
          placeholder="Type your message..."
          disabled={!ready || isResponding}
          onClearConversation={handleClearConversation}
          onIngestUrl={handleIngestUrl}
          onIngestFile={handleIngestFile}
          allowedMimetypes={allowedMimetypes}
          className={cn({ "mb-4": messages.length })}
        />
      </div>
    </div>
  );
}

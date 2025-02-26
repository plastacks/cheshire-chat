import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChatView } from "@/components/chat";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatTopBar } from "@/components/topbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { checkAuth } from "@/lib/auth";
import { ChatProvider } from "@/lib/ChatContext";

export const Route = createFileRoute("/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthenticated } = await checkAuth();
        if (!isAuthenticated) {
          navigate({ to: "/" });
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate({ to: "/" });
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex h-screen">
        <ChatSidebar>
          <SidebarInset>
            <ChatTopBar />
            <div className="flex-1 p-4 pb-0 overflow-auto scrollbar-thin">
              <ChatView />
            </div>
          </SidebarInset>
        </ChatSidebar>
      </div>
    </ChatProvider>
  );
}

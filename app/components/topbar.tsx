import { useLocation } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useChat } from "@/lib/ChatContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function ChatTopBar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const { chats, logout } = useChat();
  const currentId = searchParams.get("id") || "user";
  const currentChat = chats.find((chat) => chat.id === currentId);

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b bg-background">
      <div className="flex gap-2 items-center">
        <SidebarTrigger />
        {currentChat && (
          <h1 className="text-lg font-semibold">{currentChat.name}</h1>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
        <LogOut />
        <span className="hidden md:inline">Logout</span>
      </Button>
    </div>
  );
}

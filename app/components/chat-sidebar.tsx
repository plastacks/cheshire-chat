import * as React from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarProvider,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type Chat, useChat } from "@/lib/ChatContext";

export function ChatSidebar({ children }: { children: React.ReactNode }) {
  const { chats, handleCreateChat, handleDeleteChat, ready } = useChat();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newChatName, setNewChatName] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState<Chat | null>(null);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex justify-between items-center mb-2 px-2">
            <div className="flex flex-col items-start gap-2">
              <h3 className="text-sm font-medium">Your Chats</h3>
              {chats.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {chats.length} chat{chats.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-7 w-7"
              disabled={!ready}
            >
              <PlusIcon />
              <span className="sr-only">New Chat</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="scrollbar-thin scrollbar-track-sidebar">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Default Chat</SidebarMenuButton>
                <SidebarMenuAction
                  showOnHover
                  onClick={(e) => {
                    e.stopPropagation();
                    //setChatToDelete(chat);
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={!ready}
                >
                  <Trash2Icon />
                </SidebarMenuAction>
              </SidebarMenuItem>
              {/* {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={chat.id === currentChatId}
                    onClick={() => {
                      handleChangeChatId(chat.id);
                    }}
                    disabled={!ready}
                  >
                    {chat.name}
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat);
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={!ready}
                  >
                    <Trash2Icon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))} */}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <a href="https://cheshirecat.ai/" target="_blank">
            <img
              src="/CheshireCat-4096x1024_powered_by_black-1536x384.png"
              className="w-full p-4"
            />
          </a>
        </SidebarFooter>
      </Sidebar>

      {children}

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
            <DialogDescription>
              Enter a name for your new chat session.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            placeholder="Chat name"
            autoFocus
          />
          <DialogFooter>
            {chats.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              // onClick={() => handleCreateChat(newChatName)}
              disabled={!ready}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{chatToDelete?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              // onClick={() => {
              //   if (chatToDelete) {
              //     handleDeleteChat(chatToDelete.id);
              //   } else {
              //     toast.error("No chat to delete");
              //   }
              // }}
              disabled={!ready || !chatToDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

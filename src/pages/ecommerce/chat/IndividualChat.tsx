import { ChatSidebar } from "@/components/layout/ChatLayout";
import Loader from "@/components/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { ErrorMessage } from "@/pages/profile/Profile";
import { formatTimestampToTime } from "@/utils/date";
import { Menu, MoreVertical, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const IndividualChatPage = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { id: chatId } = useParams<{ id: string }>();
  const { currentUser, loading: authLoading } = useAuth();
  const { loading, error, chat, messages, otherUser, handleSendMessage } = useChat(chatId || "");

  if (authLoading) return <Loader />;
  if (!currentUser) return <Navigate to="/signin" />;
  if (!chatId) return <Navigate to="/chats" />;

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message="Failed To Load Chats" />;
  if (!chat || !otherUser) return <Navigate to="/chats" />;

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await handleSendMessage(newMessage);
    setIsLoading(false);
    setNewMessage("");
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Trigger */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden -ml-2 mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="h-[80vh] overflow-y-auto">
                <ChatSidebar />
              </div>
            </DrawerContent>
          </Drawer>

          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold capitalize">{otherUser.name}</h2>
            <p className="text-xs text-muted-foreground capitalize">Admin</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}
            >
              <div className="flex gap-3 max-w-[80%]">
                <div>
                  <div
                    className={`rounded-2xl p-3 ${
                      message.senderId === currentUser.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimestampToTime(message.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form className="relative" onSubmit={sendMessage}>
          <Input
            placeholder="Type a Text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            required
            className="pr-12"
          />
          <Button
            size="icon"
            type="submit"
            className="absolute right-1 top-1 h-8 w-8"
            disabled={!newMessage || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default IndividualChatPage;

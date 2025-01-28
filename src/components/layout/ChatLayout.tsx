import { Search } from "lucide-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import useChatSidebar from "@/hooks/useChatSidebar";
import Loader from "../Loader";
import { ErrorMessage } from "@/pages/profile/Profile";
import { Member } from "@/types/chat";
import { fetchManagersBySearch, Manager } from "@/utils/manager";
import { Button } from "../ui/button";

export function ChatSidebar() {
  const navigation = useNavigate();
  const [otherUser, setOtherUser] = useState<Member | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const { allChats, error, loading, findOtherUser } = useChatSidebar();

  useEffect(() => {
    const [chat] = allChats;
    setOtherUser(findOtherUser(chat));
  }, [allChats]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactsLoading(true);
    try {
      const managers = await fetchManagersBySearch(search);
      setManagers(managers);
    } catch (error) {
      console.error(error);
    } finally {
      setContactsLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4">
        <form className="relative flex" onSubmit={handleSubmit}>
          <Button type="submit" disabled={contactsLoading} className="inline-flex bg-transparent hover:bg-transparent">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Search over Contacts"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={contactsLoading}
          />
        </form>
      </div>
      <ScrollArea className="flex-1">
        {search ? (
          <SearchContacts managers={managers} loading={contactsLoading} />
        ) : allChats.length > 0 && otherUser ? (
          allChats.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer"
              onClick={() => navigation({ pathname: `/ecommerce/chat/${conversation.id}` })}
            >
              <Avatar>
                <AvatarImage src={otherUser.image} />
                <AvatarFallback>
                  {otherUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{otherUser.name}</h3>
                  <span className="text-xs text-muted-foreground">{/* {conversation.updatedAt} */}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{/* {conversation.preview} */}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground mt-10">No Chats Found</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

const SearchContacts = ({ managers, loading }: { managers: Manager[]; loading: boolean }) => {
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {managers.length > 0 ? (
        managers.map((manager) => (
          <div key={manager.uid} className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer">
            <Avatar>
              <AvatarImage src={""} />
              <AvatarFallback>
                {manager.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{manager.name}</h3>
                <span className="text-xs text-muted-foreground">{/* {conversation.updatedAt} */}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{/* {conversation.preview} */}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground mt-10">No Users Found</p>
        </div>
      )}
    </>
  );
};

const ChatLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex border rounded-xl h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80">
        <ChatSidebar />
      </div>
      {children}
    </div>
  );
};

export default ChatLayout;

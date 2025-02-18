import useChats from "@/hooks/useChatSidebar";
import { ErrorMessage } from "@/pages/profile/Profile";
import { Member } from "@/types/chat";
import { createChat } from "@/utils/chat";
import { fetchManagersBySearch, Manager, fetchManagers as fetchManagersServer } from "@/utils/manager";
import { Search } from "lucide-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import Loader from "../Loader";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function ChatSidebar() {
  const navigation = useNavigate();
  const [otherUsers, setOtherUsers] = useState<Member[] | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const { currentUser } = useAuth();

  const { allChats, error, loading, findOtherUser } = useChats();
  const [debouncedSearch] = useDebounce(search, 300);
  useEffect(() => {
    const chats = allChats;
    if (chats.length > 0) {
      chats.forEach((chat) => {
        const otherUser = findOtherUser(chat);
        if (otherUser) {
          setOtherUsers((otherUsers) => [...(otherUsers || []), otherUser]);
        }
      });
    }
  }, [allChats]);

  useEffect(() => {
    setContactsLoading(true);
    const fetchManagers = async () => {
      try {
        const managers = debouncedSearch ? await fetchManagersBySearch(debouncedSearch) : await fetchManagersServer();
        const filteredManagers = managers.filter((manager) => manager.uid !== currentUser?.uid);
        setManagers(filteredManagers);
      } catch (error) {
        console.error(error);
      } finally {
        setContactsLoading(false);
      }
    };
    fetchManagers();
  }, [debouncedSearch, currentUser?.uid]);

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setContactsLoading(true);
  //   try {
  //     const managers = await fetchManagersBySearch(search);
  //     setManagers(managers);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setContactsLoading(false);
  //   }
  // };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="h-full flex justify-center bg-background border-r">
      <ScrollArea className="flex-1">
        <Tabs defaultValue="chats" className="md:max-w-80 overflow-x-auto">
          <TabsList className="w-fit ml-4 mt-4">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>
          <TabsContent value="chats">
            {allChats.length > 0 && otherUsers?.length ? (
              allChats.map((conversation) => {
                const otherUser = otherUsers.find(
                  (user) => user.userId === conversation.members.find((m) => m.userId !== currentUser?.uid)?.userId,
                );
                return (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer"
                    onClick={() => navigation({ pathname: `/ecommerce/chat/${conversation.id}` })}
                  >
                    <Avatar>
                      <AvatarImage src={otherUser?.image} />
                      <AvatarFallback>
                        {otherUser?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex flex-col justify-between">
                        <h3 className="font-medium">{otherUser?.name}</h3>
                        <span className="text-xs text-muted-foreground self-end">
                          {conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toDateString() : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation?.lastMessage?.content}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground mt-10">No Chats Found</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="contacts">
            <div className="p-4">
              <div className="relative flex">
                <Button
                  type="submit"
                  disabled={contactsLoading}
                  className="inline-flex bg-transparent hover:bg-transparent"
                >
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </Button>
                <Input
                  placeholder="Search over Contacts"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={contactsLoading}
                  autoFocus
                />
              </div>
            </div>
            <SearchContacts managers={managers} loading={contactsLoading} setSearch={setSearch} />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}

const SearchContacts = ({
  managers,
  loading,
  setSearch,
}: {
  managers: Manager[];
  loading: boolean;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  if (loading || authLoading) {
    return <Loader />;
  }

  const initiateChat = (manager: Manager) => {
    return async function () {
      toast.promise(
        createChat([
          { userId: manager.uid, name: manager.name },
          {
            userId: currentUser?.uid || "",
            name: currentUser?.name || "",
          },
        ]),
        {
          success(chatId) {
            if (!chatId) {
              return "Failed to initiate chat";
            }
            navigate(`/ecommerce/chat/${chatId}`);
            setSearch("");
            return "Chat initiated successfully";
          },
          error(err) {
            console.error(err);
            return "Failed to initiate chat";
          },
        },
      );
    };
  };

  return (
    <>
      {managers.length > 0 ? (
        managers.map((manager) => (
          <div
            key={manager.uid}
            className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer"
            onClick={initiateChat(manager)}
          >
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
    <div
      className="flex border rounded-xl bg-background"
      style={{
        height: "calc(100dvh - 100px)",
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80">
        <ChatSidebar />
      </div>
      {children}
    </div>
  );
};

export default ChatLayout;

import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@/types/chat";
import { getChats } from "@/utils/chat";
import { useEffect, useState } from "react";

const useChats = () => {
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      setError(null);
      try {
        if (currentUser) {
          const unsubscribe = await getChats(currentUser.uid, setAllChats);
          return () => unsubscribe();
        }
      } catch (err) {
        setError("An error occurred while loading the chats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUser?.uid]);

  const findOtherUser = (chat: Chat) => {
    const other = chat?.members?.find((m) => m.userId !== currentUser?.uid);
    return other;
  };

  return { allChats, loading, error, findOtherUser };
};

export default useChats;

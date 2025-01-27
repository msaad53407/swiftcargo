import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@/types/chat";
import { getChats } from "@/utils/chat";
import { useCallback, useEffect, useState } from "react";

const useChatSidebar = () => {
	const [allChats, setAllChats] = useState<Chat[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { currentUser } = useAuth();

	const fetchAllChats = useCallback(async () => {
		setLoading(true);
		setError(null);
		if (!currentUser) return;
		try {
			const chats = await getChats(currentUser.uid);

			if (chats.length === 0) {
				return;
			}

			setAllChats(chats);
		} catch (error) {
			console.error("Error fetching chats:", error);
			setError("Failed to fetch chats");
		} finally {
			setLoading(false);
		}
	}, [currentUser]);

	useEffect(() => {
		fetchAllChats();
	}, [fetchAllChats]);

	const findOtherUser = (chat: Chat) => {
		const other = chat?.members?.find((m) => m.userId !== currentUser?.uid);
		return other;
	};

	return { allChats, loading, error, findOtherUser };
};

export default useChatSidebar;

import { useAuth } from "@/contexts/AuthContext";
import type { Chat, Member, Message } from "@/types/chat";
import {
	getChat,
	getChatIds,
	sendMessage,
	subscribeToMessages,
} from "@/utils/chat";
import { useEffect, useState } from "react";

export const useChat = (chatId: string) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [chat, setChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [otherUser, setOtherUser] = useState<Member | null>(null);
	const { currentUser } = useAuth();

	useEffect(() => {
		const loadChat = async () => {
			setLoading(true);
			setError(null);

			try {
				const chatIds = await getChatIds();
				if (!chatIds.includes(chatId)) {
					setError("Chat not found");
					return;
				}

				const chatData = await getChat(chatId);
				if (!chatData) {
					setError("Failed to load chat");
					return;
				}

				setChat(chatData);
				const other = chatData.members.find(
					(member) => member.userId !== currentUser?.uid
				);

				setOtherUser(other ?? null);

				const unsubscribe = subscribeToMessages(chatId, setMessages);
				return () => unsubscribe();
			} catch (err) {
				setError("An error occurred while loading the chat");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		loadChat();
	}, [chatId, currentUser]);

	const handleSendMessage = async (content: string) => {
		if (!currentUser) return;
		await sendMessage(chatId, content, currentUser.uid);
	};

	return { loading, error, chat, messages, otherUser, handleSendMessage };
};

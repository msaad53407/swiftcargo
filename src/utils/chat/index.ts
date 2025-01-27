import { db } from "@/firebase/config";
import type { Chat, Message } from "@/types/chat";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	where,
} from "firebase/firestore";

export const getChatIds = async (): Promise<string[]> => {
	const snapshot = await getDocs(collection(db, "chats"));
	return snapshot.docs.map((doc) => doc.id);
};

export const getChat = async (chatId: string): Promise<Chat | null> => {
	try {
		const docSnap = await getDoc(doc(db, "chats", chatId));
		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				lastMessage: docSnap.data()?.lastMessage,
				messages: docSnap.data()?.messages,
				members: docSnap.data()?.members,
				memberIds: docSnap.data()?.memberIds,
			};
		}
		return null;
	} catch (error) {
		console.error("Error fetching chat:", error);
		return null;
	}
};

export const getChats = async (userId: string): Promise<Chat[]> => {
	try {
		const q = query(
			collection(db, "chats"),
			where("memberIds", "array-contains", userId),
			orderBy("lastMessage", "desc")
		);
		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => ({
			id: doc.id,
			lastMessage: doc.data().lastMessage,
			messages: doc.data().messages,
			members: doc.data().members,
			memberIds: doc.data().memberIds,
		}));
	} catch (error) {
		console.error("Error fetching chats:", error);
		return [];
	}
};

export const subscribeToMessages = (
	chatId: string,
	callback: (messages: Message[]) => void
) => {
	const q = query(
		collection(db, "chats", chatId, "messages"),
		orderBy("createdAt")
	);

	return onSnapshot(q, (snapshot) => {
		const messages: Message[] = snapshot.docs.map((doc) => ({
			id: doc.id,
			content: doc.data().content,
			senderId: doc.data().senderId,
			createdAt: doc.data().createdAt.toDate().toISOString(),
		}));
		callback(messages);
	});
};

export const sendMessage = async (
	chatId: string,
	content: string,
	senderId: string
) => {
	try {
		await addDoc(collection(db, "chats", chatId, "messages"), {
			content,
			senderId,
			createdAt: serverTimestamp(),
		});
	} catch (error) {
		console.error("Error sending message:", error);
	}
};

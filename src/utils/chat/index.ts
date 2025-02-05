import { db } from "@/firebase/config";
import type { Chat, Member, Message } from "@/types/chat";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
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
        lastMessage: {
          content: docSnap.data()?.lastMessage?.content,
          senderId: docSnap.data()?.lastMessage?.senderId,
          createdAt: docSnap.data()?.lastMessage?.createdAt.toDate().toISOString(),
        },
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

export const getChats = async (userId: string, callback: (chats: Chat[]) => void) => {
  const q = query(
    collection(db, "chats"),
    where("memberIds", "array-contains", userId),
    orderBy("lastMessage.createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      lastMessage: {
        content: doc.data()?.lastMessage?.content,
        senderId: doc.data()?.lastMessage?.senderId,
        createdAt: doc.data()?.lastMessage?.createdAt.toDate().toISOString(),
      },
      messages: doc.data()?.messages,
      members: doc.data()?.members,
      memberIds: doc.data()?.memberIds,
    }));
    callback(chats);
  });
};

export const deleteChat = async (chatId: string) => {
  try {
    const product = await getDoc(doc(db, "chats", chatId));
    await deleteDoc(product.ref);

    const messagesRef = collection(product.ref, "messages");
    const messagesQuery = await getDocs(messagesRef);
    const messagesBatch = writeBatch(db);
    messagesQuery.docs.forEach((variationDoc) => {
      messagesBatch.delete(variationDoc.ref);
    });
    await messagesBatch.commit();

    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
};

export const createChat = async (members: Member[]) => {
  try {
    // check If chat already exists
    const memberIds = members.map((member) => member.userId);
    const q = query(collection(db, "chats"), where("memberIds", "array-contains-any", memberIds));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      let existingChatId = "";
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.memberIds.length === memberIds.length &&
          data.memberIds.every((id: string) => memberIds.includes(id))
        ) {
          existingChatId = doc.id;
        }
      });
      if (existingChatId) {
        return existingChatId;
      }
    }

    const chatRef = await addDoc(collection(db, "chats"), {
      members,
      memberIds: members.map((member) => member.userId),
    });
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};

export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));

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

export const sendMessage = async (chatId: string, content: string, senderId: string) => {
  try {
    const docRef = await addDoc(collection(db, "chats", chatId, "messages"), {
      content,
      senderId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: { content, senderId, createdAt: serverTimestamp(), id: docRef.id },
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

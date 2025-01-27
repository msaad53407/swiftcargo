export type Chat = {
	id: string;
	messages: Message[];
	lastMessage: string;
	members: Member[];
	memberIds: string[];
};

export type Message = {
	content: string;
	id: string;
	senderId: string;
	createdAt: string;
};

export type Member = {
	userId: string;
	image: string;
	name: string;
};

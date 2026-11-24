import { Chat, useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

import { chatTransport } from "./transport/chat-transport";

const miraChat = new Chat<UIMessage>({ transport: chatTransport });

export function messageText(message: UIMessage) {
	return message.parts
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");
}

export function useMiraChat() {
	const {
		messages,
		status,
		error,
		sendMessage,
		regenerate,
		stop,
		setMessages,
		clearError,
	} = useChat({ chat: miraChat });

	const isBusy = status === "submitted" || status === "streaming";
	const lastMessage = messages.at(-1);
	const isWaitingForFirstToken =
		status === "submitted" ||
		(status === "streaming" &&
			lastMessage?.role === "assistant" &&
			messageText(lastMessage) === "");

	return {
		messages,
		status,
		error,
		isBusy,
		isWaitingForFirstToken,
		send: (text: string) => sendMessage({ text }),
		retry: () => regenerate(),
		stop,
		reset: async () => {
			await stop();
			clearError();
			setMessages([]);
		},
	};
}

import { type ChatTransport, DefaultChatTransport, type UIMessage } from "ai";

import { ENV } from "@/env";
import { api } from "@/lib/api-client";

import { createMockChatTransport } from "./mock-chat-transport";

export const isMockChat = ENV.VITE_CHAT_MOCK;

export const chatTransport: ChatTransport<UIMessage> = isMockChat
	? createMockChatTransport()
	: new DefaultChatTransport({ api: api.ai.$url().toString() });

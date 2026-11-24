import type { ChatStatus } from "ai";

export const CHAT_STATUS = {
	SUBMITTED: "submitted",
	STREAMING: "streaming",
	READY: "ready",
	ERROR: "error",
} as const satisfies Record<string, ChatStatus>;

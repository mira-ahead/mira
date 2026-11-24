import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

const MOCK_REPLY =
	"This is a mock reply. Ask Mira is running without the API (VITE_CHAT_MOCK=true), so I can't answer for real or give any accessibility information.";

const FIRST_TOKEN_DELAY_MS = 600;
const TOKEN_DELAY_MS = 35;

function wait(ms: number, signal: AbortSignal | undefined) {
	return new Promise<void>((resolve, reject) => {
		const timer = setTimeout(resolve, ms);
		signal?.addEventListener(
			"abort",
			() => {
				clearTimeout(timer);
				reject(signal.reason);
			},
			{ once: true },
		);
	});
}

function replyChunks(textId: string): UIMessageChunk[] {
	const tokens = MOCK_REPLY.match(/\S+\s*/g) ?? [MOCK_REPLY];
	return [
		{ type: "start" },
		{ type: "text-start", id: textId },
		...tokens.map(
			(delta): UIMessageChunk => ({ type: "text-delta", id: textId, delta }),
		),
		{ type: "text-end", id: textId },
		{ type: "finish" },
	];
}

export function createMockChatTransport(): ChatTransport<UIMessage> {
	return {
		async sendMessages({ abortSignal }) {
			const chunks = replyChunks(crypto.randomUUID());
			let index = 0;
			return new ReadableStream<UIMessageChunk>({
				async pull(controller) {
					try {
						await wait(
							index === 0 ? FIRST_TOKEN_DELAY_MS : TOKEN_DELAY_MS,
							abortSignal,
						);
					} catch (reason) {
						controller.error(reason);
						return;
					}
					const chunk = chunks[index++];
					if (chunk) controller.enqueue(chunk);
					if (index >= chunks.length) controller.close();
				},
			});
		},
		async reconnectToStream() {
			return null;
		},
	};
}

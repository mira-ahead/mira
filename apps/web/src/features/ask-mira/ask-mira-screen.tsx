import { Button } from "@mira/ui/components/button";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@mira/ui/components/message-scroller";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";

import { MiraAvatar } from "@/components/brand/mira-avatar";
import { ScreenHeader } from "@/components/shell/screen-header";
import { useApiStatus } from "./api/get-api-status";
import { CHAT_STATUS } from "./chat-status";
import { ChatComposer } from "./components/chat-composer";
import { ChatError } from "./components/chat-error";
import {
	AssistantMessage,
	TypingIndicator,
	UserMessage,
} from "./components/chat-messages";
import { ConnectionStatus } from "./components/connection-status";
import { messageText, useMiraChat } from "./hooks/use-mira-chat";

const WELCOME = "Hi, I'm Mira. Ask me anything about getting around Paris.";

export function AskMiraScreen() {
	const chat = useMiraChat();
	const apiStatus = useApiStatus();
	const lastMessage = chat.messages.at(-1);

	const announcement = (() => {
		if (chat.isWaitingForFirstToken) return "Mira is thinking";
		if (chat.status === CHAT_STATUS.STREAMING) return "Mira is answering";
		if (
			chat.status === CHAT_STATUS.READY &&
			lastMessage?.role === "assistant"
		) {
			return `Mira said: ${messageText(lastMessage)}`;
		}
		return "";
	})();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<ScreenHeader
				leading={<MiraAvatar className="size-9" />}
				title="Mira"
				subtitle={<ConnectionStatus status={apiStatus} />}
				actions={
					chat.messages.length > 0 && (
						<Button
							variant="ghost"
							size="icon"
							aria-label="New conversation"
							onClick={() => void chat.reset()}
						>
							<ArrowCounterClockwiseIcon className="size-[18px]" />
						</Button>
					)
				}
			/>

			<MessageScrollerProvider>
				<MessageScroller className="flex-1">
					<MessageScrollerViewport>
						<MessageScrollerContent
							aria-label="Conversation with Mira"
							aria-live="off"
							className="gap-6 px-5 py-5"
						>
							<MessageScrollerItem>
								<AssistantMessage withAvatar>{WELCOME}</AssistantMessage>
							</MessageScrollerItem>

							{chat.messages.map((message) => {
								const text = messageText(message);
								if (message.role === "user") {
									return (
										<MessageScrollerItem key={message.id} scrollAnchor>
											<UserMessage text={text} />
										</MessageScrollerItem>
									);
								}
								if (!text) return null;
								return (
									<MessageScrollerItem key={message.id}>
										<AssistantMessage
											isStreaming={
												chat.status === CHAT_STATUS.STREAMING &&
												message === lastMessage
											}
										>
											{text}
										</AssistantMessage>
									</MessageScrollerItem>
								);
							})}

							{chat.isWaitingForFirstToken && (
								<MessageScrollerItem>
									<TypingIndicator />
								</MessageScrollerItem>
							)}

							{chat.error && (
								<MessageScrollerItem>
									<ChatError
										error={chat.error}
										apiStatus={apiStatus}
										onRetry={() => void chat.retry()}
									/>
								</MessageScrollerItem>
							)}
						</MessageScrollerContent>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</MessageScroller>
			</MessageScrollerProvider>

			<p role="status" className="sr-only">
				{announcement}
			</p>

			<div className="shrink-0 px-4 pt-2 pb-3">
				<ChatComposer
					isBusy={chat.isBusy}
					placeholder="Ask Mira anything"
					onSend={(text) => void chat.send(text)}
					onStop={() => void chat.stop()}
				/>
				<p className="text-caption text-muted-foreground mt-2 text-center">
					Mira can make mistakes.
				</p>
			</div>
		</div>
	);
}

import { Bubble, BubbleContent } from "@mira/ui/components/bubble";
import { Message, MessageContent } from "@mira/ui/components/message";
import { cn } from "@mira/ui/lib/utils";
import type { ReactNode } from "react";
import { Streamdown } from "streamdown";

import { MiraAvatar } from "@/components/brand/mira-avatar";

const ASSISTANT_INDENT = "pl-[42px]";

export function UserMessage({ text }: { text: string }) {
	return (
		<Message align="end">
			<span className="sr-only">You said:</span>
			<Bubble align="end" variant="default">
				<BubbleContent className="text-body rounded-[20px] rounded-br-md px-4 py-2.5 whitespace-pre-wrap">
					{text}
				</BubbleContent>
			</Bubble>
		</Message>
	);
}

export function AssistantMessage({
	children,
	withAvatar = false,
	isStreaming = false,
}: {
	children: string;
	withAvatar?: boolean;
	isStreaming?: boolean;
}) {
	return (
		<AssistantRow withAvatar={withAvatar}>
			<span className="sr-only">Mira said:</span>
			<Bubble variant="secondary" className="max-w-[90%]">
				<BubbleContent className="text-body rounded-[20px] rounded-tl-md px-4 py-2.5 leading-6">
					<Streamdown isAnimating={isStreaming}>{children}</Streamdown>
				</BubbleContent>
			</Bubble>
		</AssistantRow>
	);
}

export function TypingIndicator() {
	return (
		<AssistantRow withAvatar={false}>
			<span className="ui-mira flex w-fit gap-1 rounded-full px-4 py-3">
				{[0, 120, 240].map((delay) => (
					<span
						key={delay}
						className="bg-accent-foreground/60 size-1.5 animate-bounce rounded-full"
						style={{ animationDelay: `${delay}ms` }}
					/>
				))}
			</span>
		</AssistantRow>
	);
}

export function AssistantRow({
	withAvatar,
	children,
}: {
	withAvatar: boolean;
	children: ReactNode;
}) {
	return (
		<Message align="start" className="gap-2.5">
			{withAvatar && <MiraAvatar className="mt-0.5 size-8" />}
			<MessageContent className={cn(!withAvatar && ASSISTANT_INDENT)}>
				{children}
			</MessageContent>
		</Message>
	);
}

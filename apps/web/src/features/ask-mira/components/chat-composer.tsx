import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@mira/ui/components/input-group";
import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react";
import { type FormEvent, type KeyboardEvent, useState } from "react";

export function ChatComposer({
	isBusy,
	placeholder,
	onSend,
	onStop,
}: {
	isBusy: boolean;
	placeholder: string;
	onSend: (text: string) => void;
	onStop: () => void;
}) {
	const [input, setInput] = useState("");
	const text = input.trim();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!text || isBusy) return;
		onSend(text);
		setInput("");
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape" && isBusy) {
			event.preventDefault();
			onStop();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full">
			<InputGroup className="focus-within:ring-ring h-[52px] focus-within:ring-2">
				<label htmlFor="ask-mira-input" className="sr-only">
					Message Mira
				</label>
				<InputGroupInput
					id="ask-mira-input"
					value={input}
					onChange={(event) => setInput(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					autoComplete="off"
					enterKeyHint="send"
					className="text-body pl-5"
				/>
				<InputGroupAddon align="inline-end" className="pr-1.5">
					{isBusy ? (
						<InputGroupButton
							type="button"
							variant="secondary"
							size="icon-sm"
							onClick={onStop}
							aria-label="Stop generating"
							className="size-10"
						>
							<StopIcon weight="fill" className="size-4" />
						</InputGroupButton>
					) : (
						<InputGroupButton
							type="submit"
							variant="default"
							size="icon-sm"
							disabled={!text}
							aria-label="Send"
							className="size-10"
						>
							<ArrowUpIcon weight="bold" className="size-5" />
						</InputGroupButton>
					)}
				</InputGroupAddon>
			</InputGroup>
		</form>
	);
}

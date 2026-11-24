import { Button } from "@mira/ui/components/button";
import { WarningCircleIcon } from "@phosphor-icons/react";

import type { ApiStatus } from "../transport/api-status";

function describeError(error: Error, apiStatus: ApiStatus) {
	const isNetworkError = error instanceof TypeError;
	if (isNetworkError || apiStatus === "offline") {
		return "Mira can't be reached right now. Check your connection, then try again.";
	}
	return "Mira couldn't finish this answer. Try again in a moment.";
}

export function ChatError({
	error,
	apiStatus,
	onRetry,
}: {
	error: Error;
	apiStatus: ApiStatus;
	onRetry: () => void;
}) {
	return (
		<div role="alert" className="grid justify-items-start gap-3 pl-[42px]">
			<p className="text-caption text-danger flex gap-1.5">
				<WarningCircleIcon
					aria-hidden
					weight="bold"
					className="mt-px size-4 shrink-0"
				/>
				{describeError(error, apiStatus)}
			</p>
			<Button variant="secondary" size="sm" onClick={onRetry}>
				Try again
			</Button>
		</div>
	);
}

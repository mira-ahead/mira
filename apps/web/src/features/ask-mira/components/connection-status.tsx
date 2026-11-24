import { cn } from "@mira/ui/lib/utils";

import type { ApiStatus } from "../api/get-api-status";

const LABELS = {
	mock: "Mock replies",
	checking: "Connecting",
	online: "Online",
	offline: "Offline",
} as const satisfies Record<ApiStatus, string>;

export function ConnectionStatus({ status }: { status: ApiStatus }) {
	return (
		<span className="inline-flex items-center gap-1.5">
			<span
				aria-hidden
				className={cn(
					"size-1.5 rounded-full",
					status === "mock" && "bg-warning",
					status === "online" && "bg-success",
					status === "offline" && "bg-danger",
					status === "checking" && "bg-unknown animate-pulse",
				)}
			/>
			{LABELS[status]}
		</span>
	);
}

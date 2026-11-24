import { cn } from "@mira/ui/lib/utils";

import avatar from "@/assets/brand/mira-avatar.png";

export function MiraAvatar({ className }: { className?: string }) {
	return (
		<img
			src={avatar}
			alt=""
			aria-hidden
			className={cn(
				"border-primary/50 size-9 shrink-0 rounded-full border object-cover",
				className,
			)}
		/>
	);
}

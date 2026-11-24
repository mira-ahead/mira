import { cn } from "@mira/ui/lib/utils";
import type { ReactNode } from "react";

export function ScreenHeader({
	title,
	subtitle,
	leading,
	actions,
	className,
}: {
	title: ReactNode;
	subtitle?: ReactNode;
	leading?: ReactNode;
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<header
			className={cn(
				"bg-background/95 flex min-h-14 shrink-0 items-center gap-2.5 px-2 pt-[env(safe-area-inset-top)] backdrop-blur lg:pt-0",
				className,
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-2.5 py-2 pl-3">
				{leading}
				<div className="min-w-0">
					<h1 className="truncate text-[17px] leading-6 font-semibold tracking-[-0.01em]">
						{title}
					</h1>
					{subtitle && (
						<div className="text-caption text-muted-foreground truncate">
							{subtitle}
						</div>
					)}
				</div>
			</div>
			{actions && <div className="flex shrink-0 items-center">{actions}</div>}
		</header>
	);
}

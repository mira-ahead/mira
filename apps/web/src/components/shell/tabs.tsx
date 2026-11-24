import { cn } from "@mira/ui/lib/utils";
import { CalendarDotsIcon, GlobeIcon, type Icon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { MiraAvatar } from "@/components/brand/mira-avatar";

type Tab = {
	to: "/explore" | "/ask" | "/journeys";
	label: string;
	icon: Icon | "mira";
};

const TABS: readonly Tab[] = [
	{ to: "/journeys", label: "Journeys", icon: CalendarDotsIcon },
	{ to: "/explore", label: "Explore", icon: GlobeIcon },
	{ to: "/ask", label: "Ask Mira", icon: "mira" },
];

function TabIcon({
	icon,
	active,
	className,
}: {
	icon: Tab["icon"];
	active: boolean;
	className: string;
}) {
	if (icon === "mira") {
		return (
			<MiraAvatar
				className={cn(className, !active && "opacity-90 grayscale-[35%]")}
			/>
		);
	}
	const TabGlyph = icon;
	return (
		<TabGlyph
			aria-hidden
			weight={active ? "bold" : "regular"}
			className={cn(className, active && "text-primary")}
		/>
	);
}

export function TabBar({ className }: { className?: string }) {
	return (
		<nav
			aria-label="Main"
			className={cn(
				"border-border shrink-0 border-t bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1e8_100%)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] shadow-[inset_0_1px_0_rgb(255_255_255/0.9)]",
				className,
			)}
		>
			<ul className="mx-auto flex h-[60px] max-w-md">
				{TABS.map((tab) => (
					<li key={tab.to} className="flex-1">
						<Link
							to={tab.to}
							className="group/tab pressable text-muted-foreground data-[status=active]:text-foreground flex h-full items-center justify-center text-[11px] font-medium focus-visible:outline-none"
						>
							{({ isActive }) => (
								<span className="group-focus-visible/tab:outline-ring flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 group-focus-visible/tab:outline-3 group-focus-visible/tab:outline-solid">
									<TabIcon
										icon={tab.icon}
										active={isActive}
										className="size-[22px]"
									/>
									{tab.label}
								</span>
							)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}

export function SegmentedNav({ className }: { className?: string }) {
	return (
		<nav aria-label="Main" className={className}>
			<ul className="ui-track grid grid-cols-3 gap-1 rounded-full p-1">
				{TABS.map((tab) => (
					<li key={tab.to}>
						<Link
							to={tab.to}
							className="pressable text-caption text-muted-foreground hover:text-foreground data-[status=active]:ui-thumb data-[status=active]:text-foreground flex h-10 items-center justify-center gap-1.5 rounded-full border border-transparent font-semibold"
						>
							{({ isActive }) => (
								<>
									<TabIcon
										icon={tab.icon}
										active={isActive}
										className="size-4"
									/>
									{tab.label}
								</>
							)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}

import { Link, Outlet } from "@tanstack/react-router";

import { MiraLogo } from "@/components/brand/mira-logo";

import { SegmentedNav, TabBar } from "./tabs";

export function AppShell() {
	return (
		<div className="lg:bg-muted relative flex h-dvh flex-col overflow-hidden lg:block">
			<a
				href="#main"
				className="focus:bg-surface focus:shadow-float sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:font-semibold lg:focus:left-[432px]"
			>
				Skip to content
			</a>
			<div className="lg:rounded-panel lg:shadow-panel bg-background flex min-h-0 flex-1 flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] lg:absolute lg:inset-y-4 lg:left-4 lg:w-[400px] lg:overflow-hidden lg:px-0">
				<header className="hidden shrink-0 border-b px-3 py-2 lg:block">
					<div className="flex h-11 items-center pl-2">
						<Link to="/journeys" className="pressable rounded-lg">
							<MiraLogo />
						</Link>
					</div>
					<SegmentedNav className="mt-1" />
				</header>
				<main
					id="main"
					tabIndex={-1}
					className="flex min-h-0 flex-1 flex-col outline-none"
				>
					<Outlet />
				</main>
			</div>
			<TabBar className="lg:hidden" />
		</div>
	);
}

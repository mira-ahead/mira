import { Button, buttonVariants } from "@mira/ui/components/button";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";

import { MiraLogo } from "@/components/brand/mira-logo";

type ErrorScreenProps =
	| { variant: "not-found" }
	| { variant: "error"; onRetry: () => void };

export function ErrorScreen(props: ErrorScreenProps) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isNotFound = props.variant === "not-found";

	return (
		<div className="bg-background flex min-h-dvh flex-col">
			<header className="flex min-h-14 shrink-0 items-center border-b px-4 pt-[env(safe-area-inset-top)]">
				<Link to="/journeys" className="pressable rounded-lg">
					<MiraLogo />
				</Link>
			</header>
			<main
				id="main"
				tabIndex={-1}
				className="flex flex-1 flex-col justify-center px-5 pt-10 pb-[env(safe-area-inset-bottom)] lg:px-10"
			>
				<div className="max-w-md">
					{isNotFound ? (
						<p
							aria-hidden
							className="text-brand tabular text-[5rem] leading-[0.9] font-bold tracking-[-0.06em]"
						>
							404
						</p>
					) : (
						<WarningCircleIcon
							aria-hidden
							weight="regular"
							className="text-danger size-14"
						/>
					)}
					<div role={isNotFound ? undefined : "alert"}>
						<h1 className="text-display mt-6 font-semibold">
							{isNotFound
								? "That address isn't on the map."
								: "This screen couldn't load."}
						</h1>
						<p className="text-body text-muted-foreground mt-2">
							{isNotFound ? (
								<>
									There's no Mira screen at{" "}
									<span className="text-foreground tabular">{pathname}</span>.
									The link may be out of date.
								</>
							) : (
								"Try again. If it keeps happening, head back to Journeys and ask Mira there."
							)}
						</p>
					</div>
					<div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
						{props.variant === "not-found" ? (
							<Link to="/journeys" className={buttonVariants()}>
								Back to Journeys
							</Link>
						) : (
							<Button type="button" onClick={props.onRetry}>
								Try again
							</Button>
						)}
						<Link
							to="/ask"
							className="text-caption text-muted-foreground hover:text-foreground underline underline-offset-4"
						>
							Ask Mira
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}

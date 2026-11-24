import { Toaster } from "@mira/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export type RouterAppContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Mira",
			},
			{
				name: "description",
				content: "Predictive mobility for a more accessible world.",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				forcedTheme="light"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<Outlet />
				<Toaster />
			</ThemeProvider>
			<TanStackRouterDevtools
				position="top-right"
				toggleButtonProps={{ style: { top: "auto", bottom: "160px" } }}
			/>
		</>
	);
}

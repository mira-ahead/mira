import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderScreen } from "@/components/shell/placeholder-screen";

export const Route = createFileRoute("/_app/explore")({
	head: () => ({ meta: [{ title: "Explore - Mira" }] }),
	component: ExploreScreen,
});

function ExploreScreen() {
	return (
		<PlaceholderScreen
			title="Explore"
			heading="Where to?"
			description="Searching for places and stations, with their step-free access, is coming soon."
		/>
	);
}

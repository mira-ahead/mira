import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderScreen } from "@/components/shell/placeholder-screen";

export const Route = createFileRoute("/_app/journeys")({
	head: () => ({ meta: [{ title: "Journeys - Mira" }] }),
	component: JourneysScreen,
});

function JourneysScreen() {
	return (
		<PlaceholderScreen
			title="Journeys"
			heading="No journeys yet"
			description="The journeys you plan will show up here."
		/>
	);
}

import { createFileRoute } from "@tanstack/react-router";

import { AskMiraScreen } from "@/features/ask-mira/ask-mira-screen";

export const Route = createFileRoute("/_app/ask")({
	head: () => ({ meta: [{ title: "Ask Mira - Mira" }] }),
	component: AskMiraScreen,
});

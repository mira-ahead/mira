import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";

import { isMockChat } from "./chat-transport";

export type ApiStatus = "mock" | "checking" | "online" | "offline";

export const apiStatusQueryOptions = queryOptions({
	queryKey: ["api", "health"],
	queryFn: async ({ signal }) => {
		const response = await api.health.$get(undefined, { init: { signal } });
		if (!response.ok) throw new Error(`API answered ${response.status}`);
		return response.json();
	},
	enabled: !isMockChat,
	retry: 1,
	refetchInterval: 30_000,
});

export function useApiStatus(): ApiStatus {
	const { data, isError } = useQuery(apiStatusQueryOptions);
	if (isMockChat) return "mock";
	if (data?.status === "ok") return "online";
	if (isError) return "offline";
	return "checking";
}

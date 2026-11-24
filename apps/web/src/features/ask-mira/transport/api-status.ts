import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiUrl } from "@/lib/api";

import { isMockChat } from "./chat-transport";

export type ApiStatus = "mock" | "checking" | "online" | "offline";

const apiStatusQuery = queryOptions({
	queryKey: ["api", "status"],
	queryFn: async ({ signal }) => {
		const response = await fetch(apiUrl("/"), { signal });
		if (!response.ok) throw new Error(`API answered ${response.status}`);
		return true;
	},
	enabled: !isMockChat,
	retry: 1,
	refetchInterval: 30_000,
});

export function useApiStatus(): ApiStatus {
	const { isSuccess, isError } = useQuery(apiStatusQuery);
	if (isMockChat) return "mock";
	if (isSuccess) return "online";
	if (isError) return "offline";
	return "checking";
}

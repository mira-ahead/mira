import { ENV } from "@/env";

export function apiUrl(path: `/${string}`) {
	return new URL(path, ENV.VITE_SERVER_URL).toString();
}

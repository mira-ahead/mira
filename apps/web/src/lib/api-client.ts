import { ENV } from "@/env";

const API_BASE_URL = ENV.VITE_SERVER_URL.replace(/\/+$/, "");

export function apiUrl(path: `/${string}`) {
	return `${API_BASE_URL}${path}`;
}

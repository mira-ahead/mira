import { hc } from "hono/client";
import type { AppType } from "server";

import { ENV } from "@/env";

export const api = hc<AppType>(ENV.VITE_SERVER_URL.replace(/\/+$/, ""));

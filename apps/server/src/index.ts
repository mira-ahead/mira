import { createMistral } from "@ai-sdk/mistral";
import { propagateAttributes } from "@langfuse/tracing";
import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
	toUIMessageStream,
} from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { isClickHouseReachable } from "./clickhouse";
import { ENV } from "./env.server";
import { flushTraces } from "./langfuse";

const mistral = createMistral({
	apiKey: ENV.MISTRAL_API_KEY,
});

const app = new Hono()
	.use(logger())
	.use(
		"/*",
		cors({
			origin: ENV.CORS_ORIGIN,
			allowMethods: ["GET", "POST", "OPTIONS"],
		}),
	)
	.get("/health", (c) => c.json({ status: "ok" }))
	.get("/health/clickhouse", async (c) =>
		(await isClickHouseReachable())
			? c.json({ status: "ok" }, 200)
			: c.json({ status: "error" }, 503),
	)
	.post("/ai", async (c) => {
		const body = await c.req.json();
		const uiMessages = body.messages || [];
		const messages = await convertToModelMessages(uiMessages);
		const result = propagateAttributes({ traceName: "mira-agent" }, () =>
			streamText({
				model: mistral("mistral-small-latest"),
				messages,
				telemetry: { functionId: "mira-agent" },
			}),
		);
		c.executionCtx.waitUntil(
			Promise.resolve(result.finishReason).then(flushTraces, flushTraces),
		);

		return createUIMessageStreamResponse({
			stream: toUIMessageStream({ stream: result.stream }),
		});
	})
	.get("/", (c) => c.text("OK"));

export type AppType = typeof app;

export default app;

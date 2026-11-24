import { LangfuseSpanProcessor } from "@langfuse/otel";
import { LangfuseVercelAiSdkIntegration } from "@langfuse/vercel-ai-sdk";
import { context } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import { registerTelemetry } from "ai";

import { ENV } from "./env.server";

const { LANGFUSE_PUBLIC_KEY: publicKey, LANGFUSE_SECRET_KEY: secretKey } = ENV;

const processor =
	publicKey && secretKey
		? new LangfuseSpanProcessor({
				publicKey,
				secretKey,
				baseUrl: ENV.LANGFUSE_BASE_URL,
				environment: ENV.NODE_ENV,
				exportMode: "immediate",
			})
		: undefined;

if (processor) {
	context.setGlobalContextManager(
		new AsyncLocalStorageContextManager().enable(),
	);
	const provider = new BasicTracerProvider({ spanProcessors: [processor] });
	registerTelemetry(
		new LangfuseVercelAiSdkIntegration({
			tracer: provider.getTracer("mira-server"),
		}),
	);
}

export async function flushTraces() {
	await processor
		?.forceFlush()
		.catch((error) => console.warn("Langfuse flush failed", error));
}

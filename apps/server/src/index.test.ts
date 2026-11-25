import { afterEach, describe, expect, it, vi } from "vitest";

import app from "./index";

describe("GET /health", () => {
	it("returns 200 with status ok", async () => {
		const res = await app.request("/health");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});
});

describe("GET /health/clickhouse", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	const stubClickHouse = (response: () => Promise<Response>) => {
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const fetchMock = vi.fn(response);
		vi.stubGlobal("fetch", fetchMock);
		return fetchMock;
	};

	it("returns 200 with status ok when SELECT 1 succeeds", async () => {
		const fetchMock = stubClickHouse(async () => new Response('{"1":1}\n'));

		const res = await app.request("/health/clickhouse");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it("returns 503 with status error when credentials are rejected", async () => {
		stubClickHouse(
			async () =>
				new Response(
					"Code: 516. DB::Exception: test: Authentication failed. (AUTHENTICATION_FAILED)",
					{ status: 403 },
				),
		);

		const res = await app.request("/health/clickhouse");

		expect(res.status).toBe(503);
		expect(await res.json()).toEqual({ status: "error" });
	});

	it("returns 503 with status error when ClickHouse is unreachable", async () => {
		stubClickHouse(async () => {
			throw new TypeError("fetch failed");
		});

		const res = await app.request("/health/clickhouse");

		expect(res.status).toBe(503);
		expect(await res.json()).toEqual({ status: "error" });
	});
});

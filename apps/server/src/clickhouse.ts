import { createClient } from "@clickhouse/client-web";

import { ENV } from "./env.server";

export const clickhouse = createClient({
	url: ENV.CLICKHOUSE_URL,
	username: ENV.CLICKHOUSE_USER,
	password: ENV.CLICKHOUSE_PASSWORD,
	request_timeout: 5000,
});

export const isClickHouseReachable = async () => {
	try {
		const result = await clickhouse.query({
			query: "SELECT 1",
			format: "JSONEachRow",
		});
		await result.json();
		return true;
	} catch (error) {
		console.error("ClickHouse health check failed", error);
		return false;
	}
};

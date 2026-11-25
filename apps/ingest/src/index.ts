import { ENV } from "./env.server";

const IDFM_EXPORT_URL =
	"https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/etat-des-ascenseurs/exports/jsonl";
const INSERT_QUERY =
	"INSERT INTO lift_status_raw (payload) FORMAT JSONAsString";
const PARIS_HOURS = new Set([9, 14, 20]);
const MIN_EXPECTED_LIFTS = 500;

const parisHour = (timestamp: number) =>
	Number(
		new Intl.DateTimeFormat("en-GB", {
			timeZone: "Europe/Paris",
			hour: "numeric",
			hourCycle: "h23",
		}).format(timestamp),
	);

const writtenRows = (response: Response) => {
	const summary = response.headers.get("X-ClickHouse-Summary");
	if (!summary) {
		throw new Error("ClickHouse response has no X-ClickHouse-Summary header");
	}
	const { written_rows } = JSON.parse(summary) as { written_rows?: string };
	return Number(written_rows ?? 0);
};

const collect = async () => {
	const idfm = await fetch(IDFM_EXPORT_URL, {
		headers: { Authorization: `Apikey ${ENV.IDFM_API_KEY}` },
	});
	if (!idfm.ok || !idfm.body) {
		throw new Error(`IDFM export failed with status ${idfm.status}`);
	}

	const insertUrl = new URL(ENV.CLICKHOUSE_URL);
	insertUrl.searchParams.set("query", INSERT_QUERY);
	insertUrl.searchParams.set("wait_end_of_query", "1");

	const insert = await fetch(insertUrl, {
		method: "POST",
		headers: {
			"X-ClickHouse-User": ENV.CLICKHOUSE_USER,
			"X-ClickHouse-Key": ENV.CLICKHOUSE_PASSWORD,
		},
		body: idfm.body,
	});
	if (!insert.ok) {
		const detail = (await insert.text()).slice(0, 300);
		throw new Error(
			`ClickHouse insert failed with status ${insert.status}: ${detail}`,
		);
	}

	const lifts = writtenRows(insert);
	if (lifts < MIN_EXPECTED_LIFTS) {
		throw new Error(
			`IDFM export gave ${lifts} lifts, expected at least ${MIN_EXPECTED_LIFTS}: check IDFM_API_KEY`,
		);
	}
	console.info(`Inserted ${lifts} lift statuses`);
};

export default {
	async scheduled(controller) {
		if (!PARIS_HOURS.has(parisHour(controller.scheduledTime))) return;
		await collect();
	},
} satisfies ExportedHandler;

CREATE TABLE IF NOT EXISTS lift_status_raw (
	fetched_at DateTime DEFAULT now(),
	payload String
)
ENGINE = MergeTree
ORDER BY fetched_at;

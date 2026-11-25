SELECT
	uniqExact(fetched_at) AS snapshots,
	count() AS rows,
	min(fetched_at) AS first_snapshot,
	max(fetched_at) AS last_snapshot,
	formatReadableSize(sum(length(payload))) AS raw_payload_size
FROM lift_status_raw;

SELECT
	fetched_at,
	count() AS rows,
	uniqExact(JSONExtractString(payload, 'liftid')) AS distinct_lifts,
	rows - distinct_lifts AS duplicates
FROM lift_status_raw
GROUP BY fetched_at
ORDER BY fetched_at;

SELECT
	fetched_at,
	if(rank = 1, NULL, dateDiff('minute', previous, fetched_at)) AS minutes_since_previous
FROM (
	SELECT
		fetched_at,
		lagInFrame(fetched_at) OVER (ORDER BY fetched_at) AS previous,
		row_number() OVER (ORDER BY fetched_at) AS rank
	FROM (SELECT DISTINCT fetched_at FROM lift_status_raw)
)
ORDER BY fetched_at;

SELECT
	JSONExtractString(payload, 'liftmode') AS mode,
	count() AS lifts,
	uniqExact(JSONExtractString(payload, 'zdcid')) AS stations
FROM lift_status_raw
WHERE fetched_at = (SELECT max(fetched_at) FROM lift_status_raw)
GROUP BY mode
ORDER BY lifts DESC;

SELECT
	JSONExtractString(payload, 'liftid') AS lift_id,
	any(JSONExtractString(payload, 'liftmode')) AS mode,
	uniqExact(fetched_at) AS seen_in_snapshots,
	min(fetched_at) AS first_seen,
	max(fetched_at) AS last_seen
FROM lift_status_raw
GROUP BY lift_id
HAVING seen_in_snapshots < (SELECT uniqExact(fetched_at) FROM lift_status_raw)
ORDER BY first_seen, lift_id;

SELECT
	fetched_at,
	countIf(status = 'available') AS available,
	countIf(status = 'notavailable') AS not_available,
	countIf(status = 'unknown') AS unknown,
	round(100 * not_available / count(), 1) AS not_available_pct
FROM (
	SELECT fetched_at, JSONExtractString(payload, 'liftstatus') AS status
	FROM lift_status_raw
)
GROUP BY fetched_at
ORDER BY fetched_at;

SELECT
	JSONExtractString(payload, 'liftstatus') AS status,
	JSONExtractString(payload, 'liftstate') AS state,
	JSONExtractRaw(payload, 'liftreason') AS reason,
	count() AS rows
FROM lift_status_raw
GROUP BY status, state, reason
ORDER BY rows DESC;

SELECT
	fetched_at,
	countIf(updated_at IS NULL) AS missing_update,
	countIf(updated_at > fetched_at) AS update_after_fetch,
	quantileExact(0.5)(dateDiff('hour', updated_at, fetched_at)) AS median_age_hours,
	quantileExact(0.9)(dateDiff('hour', updated_at, fetched_at)) AS p90_age_hours,
	max(dateDiff('day', updated_at, fetched_at)) AS max_age_days
FROM (
	SELECT
		fetched_at,
		-- liftstateupdate is Paris local time, with no offset.
		parseDateTimeBestEffortOrNull(
			JSONExtractString(payload, 'liftstateupdate'),
			'Europe/Paris'
		) AS updated_at
	FROM lift_status_raw
)
GROUP BY fetched_at
ORDER BY fetched_at;

SELECT transition, count() AS lifts
FROM (
	SELECT
		concat(lagInFrame(status) OVER w, ' -> ', status) AS transition,
		row_number() OVER w AS rank
	FROM (
		SELECT
			fetched_at,
			JSONExtractString(payload, 'liftid') AS lift_id,
			JSONExtractString(payload, 'liftstatus') AS status
		FROM lift_status_raw
	)
	WINDOW w AS (
		PARTITION BY lift_id
		ORDER BY fetched_at
		ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
	)
)
WHERE rank > 1
GROUP BY transition
ORDER BY lifts DESC;

SELECT
	field.1 AS key,
	countIf(field.2 IN ('null', '""')) AS empty,
	count() AS total,
	round(100 * empty / total, 1) AS empty_pct
FROM lift_status_raw
ARRAY JOIN JSONExtractKeysAndValuesRaw(payload) AS field
WHERE fetched_at = (SELECT max(fetched_at) FROM lift_status_raw)
GROUP BY key
ORDER BY empty DESC;

SELECT
	JSONExtractString(payload, 'liftid') AS lift_id,
	any(JSONExtractString(payload, 'zdcname')) AS station,
	any(JSONExtractString(payload, 'liftmode')) AS mode,
	countIf(JSONExtractString(payload, 'liftstatus') = 'notavailable') AS snapshots_down,
	count() AS snapshots_seen
FROM lift_status_raw
GROUP BY lift_id
HAVING snapshots_down > 0
ORDER BY snapshots_down DESC, lift_id
LIMIT 20;

SELECT
	min(day) AS first_day,
	max(day) AS last_day,
	uniqExact(day) AS days,
	uniqExact(station) AS stations,
	uniqExact(station, lift_code) AS lifts,
	count() AS rows
FROM scratch.dispotrains_daily_2008;

SELECT status, count() AS rows, round(100 * rows / sum(rows) OVER (), 2) AS pct
FROM scratch.dispotrains_daily_2008
GROUP BY status
ORDER BY rows DESC;

SELECT
	toYear(lastupdate) AS year,
	count() AS events,
	uniqExact(elevatorid) AS lifts,
	round(events / lifts) AS events_per_lift
FROM scratch.dispotrains_statuses
GROUP BY year
ORDER BY year;

SELECT
	replaceRegexpOne(state, ' jusqu''au \\d{2}/\\d{2}/\\d{4}$', ' jusqu''au <date>') AS state_family,
	count() AS events
FROM scratch.dispotrains_statuses
GROUP BY state_family
ORDER BY events DESC;

SELECT
	toYear(lastupdate) AS year,
	countIf(state = previous_state) AS repeated,
	count() AS events,
	round(100 * repeated / events, 1) AS repeated_pct
FROM (
	SELECT
		lastupdate,
		state,
		lagInFrame(state) OVER (PARTITION BY elevatorid ORDER BY lastupdate ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS previous_state
	FROM scratch.dispotrains_statuses
	WHERE elevatorid != ''
)
GROUP BY year
ORDER BY year;

SELECT
	countIf(in_idfm) AS matched,
	count() AS dispotrains_ids,
	round(100 * matched / dispotrains_ids, 1) AS matched_pct
FROM (
	SELECT
		elevatorid,
		elevatorid IN (
			SELECT DISTINCT JSONExtractString(payload, 'privateelevatorid')
			FROM default.lift_status_raw
		) AS in_idfm
	FROM scratch.dispotrains_statuses
	WHERE elevatorid != ''
	GROUP BY elevatorid
);

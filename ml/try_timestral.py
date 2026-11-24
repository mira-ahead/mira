import resource
import sys
import time

import numpy as np
from timestral import TimestralForecaster

MODEL = "mistralai/Timestral-5M"
HORIZON = 24
HISTORY_HOURS = 14 * 24


def sample_series() -> np.ndarray:
    rng = np.random.default_rng(0)
    hours = np.arange(HISTORY_HOURS)
    daily_cycle = 0.05 + 0.03 * np.sin(2 * np.pi * hours / 24)
    noise = rng.normal(0, 0.01, HISTORY_HOURS)
    return np.clip(daily_cycle + noise, 0, 1)


def peak_memory_mb() -> float:
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return peak / 1e6 if sys.platform == "darwin" else peak / 1e3


def main() -> None:
    series = sample_series()

    start = time.perf_counter()
    forecaster = TimestralForecaster.from_pretrained(MODEL)
    loaded = time.perf_counter()
    forecast = forecaster.forecast(series, prediction_length=HORIZON)
    done = time.perf_counter()

    low = np.clip(forecast.quantile(0.1).numpy().reshape(-1), 0, 1)
    median = np.clip(forecast.median.numpy().reshape(-1), 0, 1)
    high = np.clip(forecast.quantile(0.9).numpy().reshape(-1), 0, 1)

    print(f"{MODEL}, {HISTORY_HOURS} h of context, next {HORIZON} h")
    print("hour   low  median  high")
    for hour in range(HORIZON):
        print(f"+{hour + 1:<4} {low[hour]:.3f}  {median[hour]:.3f}  {high[hour]:.3f}")
    print(f"load {loaded - start:.2f}s, forecast {done - loaded:.2f}s, peak memory {peak_memory_mb():.0f} MB")


if __name__ == "__main__":
    main()
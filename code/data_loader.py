import os
import pandas as pd
from datetime import timedelta

def load_labeled_actuals_and_predictions(data_folder="data", sample_limit=500):
    stitched = []

    files = sorted(f for f in os.listdir(data_folder) if f.endswith(".csv"))

    for fname in files:
        path = os.path.join(data_folder, fname)
        df = pd.read_csv(path)
        df["Timestamp"] = pd.to_datetime(df["Timestamp"])

        if df.empty:
            continue

        max_ts = df["Timestamp"].max()
        last_day_start = max_ts - timedelta(days=1)

        df["SourceFile"] = fname
        df["Type"] = df["Timestamp"].apply(lambda ts: "actual" if ts >= last_day_start else "predicted")
        stitched.append(df)

    full_df = pd.concat(stitched).sort_values("Timestamp").reset_index(drop=True)

    if len(full_df) > sample_limit:
        full_df = full_df.iloc[::len(full_df) // sample_limit].copy()

    return full_df
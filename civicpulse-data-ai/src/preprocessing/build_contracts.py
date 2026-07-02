"""
build_contracts.py
Builds data/processed/contracts_dataset.csv matching the `contracts` table
schema requested by Antigravity:

id, project_name, contractor_name, contractor_reg_number, awarded_amount_ngn,
location_lat, location_lng, lga, state, official_status,
citizen_verified_status, photo_evidence_url, created_at

Currently contains ONE verified real anchor (Anambra ghost contractor).
Real contract-level data (e.g. from NOCOPO, state procurement portals, or
BPP contract award notices) still needs to be sourced to expand this file —
see the TODO at the bottom for what to fetch next.
"""
import csv
import uuid
from datetime import datetime, timezone
from pathlib import Path

FIELDNAMES = [
    "id", "project_name", "contractor_name", "contractor_reg_number",
    "awarded_amount_ngn", "location_lat", "location_lng", "lga", "state",
    "official_status", "citizen_verified_status", "photo_evidence_url",
    "created_at"
]


def build_contracts():
    now = datetime.now(timezone.utc).isoformat()
    records = []

    # --- Verified real anchor: Anambra ghost contractor ---
    records.append({
        "id": str(uuid.uuid4()),
        "project_name": "School Rehabilitation Project",
        "contractor_name": "GhostCorp Ltd",
        "contractor_reg_number": "PLACEHOLDER",
        "awarded_amount_ngn": 45_000_000,
        "location_lat": "PLACEHOLDER",
        "location_lng": "PLACEHOLDER",
        "lga": "PLACEHOLDER",
        "state": "Anambra",
        "official_status": "PLACEHOLDER",
        "citizen_verified_status": "Ghost / Not Found",
        "photo_evidence_url": "PLACEHOLDER",
        "created_at": now,
    })

    return records


def write_csv(records, path=None):
    if path is None:
        repo_root = Path(__file__).resolve().parents[2]
        path = repo_root / "data" / "processed" / "contracts_dataset.csv"
    else:
        path = Path(path)

    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for r in records:
            row = {k: r.get(k, "PLACEHOLDER") for k in FIELDNAMES}
            writer.writerow(row)


if __name__ == "__main__":
    records = build_contracts()
    write_csv(records)
    print(f"Wrote {len(records)} rows to contracts_dataset.csv")
    print("NOTE: only 1 verified real contract anchor is in this file.")
    print("The remaining rows are intentionally left as PLACEHOLDER until a verifiable public source is found.")
    print("TODO: source real contract award data to expand this dataset, e.g.:")
    print(" - Bureau of Public Procurement (BPP) contract award notices")
    print(" - NOCOPO (Nigeria Open Contracting Portal)")
    print(" - State-level procurement portals (Delta, Anambra SUBEB, etc.)")

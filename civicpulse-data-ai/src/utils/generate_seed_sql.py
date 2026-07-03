import os
from pathlib import Path

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEMO_USER_ID = "11111111-1111-4111-8111-111111111111"
GENERATED_AT = "2026-07-02T02:31:05.491923+00:00"

DEMO_CONTRACT_DEFAULTS = {
    "project_name": "Community School Rehabilitation, Awka South",
    "contractor_name": "Nnewi Buildworks Ltd",
    "awarded_amount_ngn": 45000000,
    "location_lat": 6.2105,
    "location_lng": 7.0723,
    "lga": "Awka South",
    "state": "Anambra",
    "official_status": "completed",
    "citizen_verified_status": "ghost_not_found",
    "photo_evidence_url": "https://example.com/civicpulse/evidence/anambra-school-rehabilitation.jpg",
    "created_at": "2026-07-02T04:30:12.403700+00:00",
}


def is_placeholder(val):
    return pd.isna(val) or val is None or str(val).strip().lower() in {"", "placeholder", "nan"}


def escape_sql_string(val):
    if is_placeholder(val):
        return "NULL"
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"


def format_numeric(val):
    if is_placeholder(val):
        return "NULL"
    try:
        return str(float(val))
    except ValueError:
        return "NULL"


def format_boolean(val):
    if pd.isna(val) or val is None:
        return "FALSE"
    val_str = str(val).strip().lower()
    return "TRUE" if val_str in ["true", "1", "t", "y", "yes"] else "FALSE"


def budget_severity(deviation_pct):
    deviation = abs(float(deviation_pct))
    if deviation >= 50:
        return "critical"
    if deviation >= 25:
        return "high"
    return "none"


def clean_budget_row(row):
    allocated = float(row["allocated_ngn"])
    actual = float(row["actual_ngn"])
    deviation = row["deviation_pct"]
    if is_placeholder(deviation):
        deviation = round(((actual - allocated) / allocated) * 100, 2)
    else:
        deviation = float(deviation)

    severity = budget_severity(deviation)
    alert_fired = abs(float(deviation)) > 25
    state = "Federal" if is_placeholder(row["state"]) else row["state"]

    line_item = row["line_item"]
    if is_placeholder(line_item):
        line_item = f"{row['ministry']} budget line"

    return {
        "id": row["id"],
        "user_id": DEMO_USER_ID,
        "ministry": row["ministry"],
        "state": state,
        "year": int(row["year"]),
        "line_item": line_item,
        "allocated_ngn": allocated,
        "actual_ngn": actual,
        "deviation_pct": deviation,
        "alert_fired": alert_fired,
        "alert_severity": severity,
        "sources_json": row["sources_json"],
        "created_at": row["created_at"] if not is_placeholder(row["created_at"]) else GENERATED_AT,
    }


def clean_contract_row(row):
    cleaned = {"id": row["id"]}
    for key, default in DEMO_CONTRACT_DEFAULTS.items():
        cleaned[key] = default if is_placeholder(row.get(key)) else row[key]
    if cleaned["project_name"] == "School Rehabilitation Project":
        cleaned["project_name"] = DEMO_CONTRACT_DEFAULTS["project_name"]
    if cleaned["contractor_name"] == "GhostCorp Ltd":
        cleaned["contractor_name"] = DEMO_CONTRACT_DEFAULTS["contractor_name"]
    if cleaned["citizen_verified_status"] == "Ghost / Not Found":
        cleaned["citizen_verified_status"] = DEMO_CONTRACT_DEFAULTS["citizen_verified_status"]
    return cleaned


def generate_seed_sql():
    budget_csv = PROJECT_ROOT / "civicpulse-data-ai" / "data" / "processed" / "clean_budget_data.csv"
    contracts_csv = PROJECT_ROOT / "civicpulse-data-ai" / "data" / "processed" / "contracts_dataset.csv"
    output_sql = PROJECT_ROOT / "civicpulse-data-ai" / "migrations" / "seed_data.sql"

    os.makedirs(os.path.dirname(output_sql), exist_ok=True)

    sql_lines = [
        "-- seed_data.sql",
        "-- Auto-generated seed data insertion from clean CSVs against root schema.sql",
        "BEGIN;",
        "",
        "INSERT INTO auth.users (",
        "    id, instance_id, aud, role, email, encrypted_password,",
        "    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data",
        ") VALUES (",
        f"    '{DEMO_USER_ID}', '00000000-0000-0000-0000-000000000000', 'authenticated',",
        "    'authenticated', 'demo@civicpulse.local', crypt('CivicPulseDemo123!', gen_salt('bf')),",
        "    now(), now(), now(), '{\"provider\":\"email\",\"providers\":[\"email\"]}'::jsonb,",
        "    '{\"full_name\":\"CivicPulse Demo User\"}'::jsonb",
        ") ON CONFLICT (id) DO NOTHING;",
        "",
        "INSERT INTO public.profiles (id, email, full_name)",
        f"VALUES ('{DEMO_USER_ID}', 'demo@civicpulse.local', 'CivicPulse Demo User')",
        "ON CONFLICT (id) DO NOTHING;",
        "",
        "TRUNCATE TABLE public.budget_records CASCADE;",
        "TRUNCATE TABLE public.contracts CASCADE;",
        "",
    ]

    # Keep numpy as a direct import dependency check for the data toolchain.
    _ = np.nan

    if os.path.exists(budget_csv):
        df_budget = pd.read_csv(budget_csv)
        sql_lines.append("-- Seeding budget_records")
        for _, row in df_budget.iterrows():
            cleaned = clean_budget_row(row)
            id_val = escape_sql_string(cleaned["id"])
            user_id_val = escape_sql_string(cleaned["user_id"])
            min_val = escape_sql_string(cleaned["ministry"])
            state_val = escape_sql_string(cleaned["state"])
            year_val = str(cleaned["year"])
            line_val = escape_sql_string(cleaned["line_item"])
            alloc_val = format_numeric(cleaned["allocated_ngn"])
            act_val = format_numeric(cleaned["actual_ngn"])
            dev_val = format_numeric(cleaned["deviation_pct"])
            alert_val = "TRUE" if cleaned["alert_fired"] else "FALSE"
            sev_val = escape_sql_string(cleaned["alert_severity"])

            sources = cleaned["sources_json"]
            if is_placeholder(sources):
                sources_val = "'{}'::jsonb"
            else:
                escaped_sources = str(sources).replace("'", "''")
                sources_val = f"'{escaped_sources}'::jsonb"

            created_val = escape_sql_string(cleaned["created_at"])

            stmt = (
                f"INSERT INTO public.budget_records (id, user_id, ministry, state, year, line_item, "
                f"allocated_ngn, actual_ngn, deviation_pct, alert_fired, alert_severity, sources_json, created_at) "
                f"VALUES ({id_val}, {user_id_val}, {min_val}, {state_val}, {year_val}, {line_val}, "
                f"{alloc_val}, {act_val}, {dev_val}, {alert_val}, {sev_val}, {sources_val}, {created_val});"
            )
            sql_lines.append(stmt)
        sql_lines.append("")

    if os.path.exists(contracts_csv):
        df_contracts = pd.read_csv(contracts_csv)
        sql_lines.append("-- Seeding contracts")
        for _, row in df_contracts.iterrows():
            cleaned = clean_contract_row(row)
            id_val = escape_sql_string(cleaned["id"])
            proj_val = escape_sql_string(cleaned["project_name"])
            cont_val = escape_sql_string(cleaned["contractor_name"])
            amt_val = format_numeric(cleaned["awarded_amount_ngn"])
            lat_val = format_numeric(cleaned["location_lat"])
            lng_val = format_numeric(cleaned["location_lng"])
            lga_val = escape_sql_string(cleaned["lga"])
            state_val = escape_sql_string(cleaned["state"])
            off_val = escape_sql_string(cleaned["official_status"])
            cit_val = escape_sql_string(cleaned["citizen_verified_status"])
            photo_val = escape_sql_string(cleaned["photo_evidence_url"])
            created_val = escape_sql_string(cleaned["created_at"])

            stmt = (
                f"INSERT INTO public.contracts (id, project_name, contractor_name, "
                f"awarded_amount_ngn, location_lat, location_lng, lga, state, official_status, "
                f"citizen_verified_status, photo_evidence_url, created_at) "
                f"VALUES ({id_val}, {proj_val}, {cont_val}, {amt_val}, {lat_val}, {lng_val}, "
                f"{lga_val}, {state_val}, {off_val}, {cit_val}, {photo_val}, {created_val});"
            )
            sql_lines.append(stmt)
        sql_lines.append("")

    sql_lines.append("COMMIT;")

    with open(output_sql, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines) + "\n")

    print(f"Generated SQL seed file at {output_sql} with {len(sql_lines)} lines.")


if __name__ == "__main__":
    generate_seed_sql()

import os
import pandas as pd
import numpy as np

def escape_sql_string(val):
    if pd.isna(val) or val is None:
        return "NULL"
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"

def format_numeric(val):
    if pd.isna(val) or val is None or str(val).strip() == "" or str(val).lower() == "placeholder":
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

def generate_seed_sql():
    budget_csv = "C:/Users/Bae/Downloads/BuildverseHackaron/civicpulse-data-ai/data/processed/clean_budget_data.csv"
    contracts_csv = "C:/Users/Bae/Downloads/BuildverseHackaron/civicpulse-data-ai/data/processed/contracts_dataset.csv"
    output_sql = "C:/Users/Bae/Downloads/BuildverseHackaron/civicpulse-data-ai/migrations/seed_data.sql"
    
    os.makedirs(os.path.dirname(output_sql), exist_ok=True)
    
    sql_lines = [
        "-- seed_data.sql",
        "-- Auto-generated seed data insertion from clean CSVs",
        "BEGIN;",
        "",
        "TRUNCATE TABLE budget_records CASCADE;",
        "TRUNCATE TABLE contracts CASCADE;",
        ""
    ]
    
    # 1. Process Budgets
    if os.path.exists(budget_csv):
        df_budget = pd.read_csv(budget_csv)
        sql_lines.append("-- Seeding budget_records")
        for _, row in df_budget.iterrows():
            id_val = escape_sql_string(row['id'])
            min_val = escape_sql_string(row['ministry'])
            state_val = escape_sql_string(row['state'])
            lga_val = escape_sql_string(row['lga'])
            year_val = str(int(row['year']))
            line_val = escape_sql_string(row['line_item'])
            alloc_val = format_numeric(row['allocated_ngn'])
            act_val = format_numeric(row['actual_ngn'])
            dev_val = format_numeric(row['deviation_pct'])
            alert_val = format_boolean(row['alert_fired'])
            sev_val = escape_sql_string(row['alert_severity'])
            
            # format sources_json as JSONB
            sources = row['sources_json']
            if pd.isna(sources) or sources == "":
                sources_val = "'{}'::jsonb"
            else:
                escaped_sources = str(sources).replace("'", "''")
                sources_val = f"'{escaped_sources}'::jsonb"
                
            created_val = escape_sql_string(row['created_at'])
            
            stmt = (
                f"INSERT INTO budget_records (id, ministry, state, lga, year, line_item, "
                f"allocated_ngn, actual_ngn, deviation_pct, alert_fired, alert_severity, sources_json, created_at) "
                f"VALUES ({id_val}, {min_val}, {state_val}, {lga_val}, {year_val}, {line_val}, "
                f"{alloc_val}, {act_val}, {dev_val}, {alert_val}, {sev_val}, {sources_val}, {created_val});"
            )
            sql_lines.append(stmt)
        sql_lines.append("")
    
    # 2. Process Contracts
    if os.path.exists(contracts_csv):
        df_contracts = pd.read_csv(contracts_csv)
        sql_lines.append("-- Seeding contracts")
        for _, row in df_contracts.iterrows():
            id_val = escape_sql_string(row['id'])
            proj_val = escape_sql_string(row['project_name'])
            cont_val = escape_sql_string(row['contractor_name'])
            reg_val = escape_sql_string(row['contractor_reg_number'])
            amt_val = format_numeric(row['awarded_amount_ngn'])
            lat_val = format_numeric(row['location_lat'])
            lng_val = format_numeric(row['location_lng'])
            lga_val = escape_sql_string(row['lga'])
            state_val = escape_sql_string(row['state'])
            off_val = escape_sql_string(row['official_status'])
            cit_val = escape_sql_string(row['citizen_verified_status'])
            photo_val = escape_sql_string(row['photo_evidence_url'])
            created_val = escape_sql_string(row['created_at'])
            
            stmt = (
                f"INSERT INTO contracts (id, project_name, contractor_name, contractor_reg_number, "
                f"awarded_amount_ngn, location_lat, location_lng, lga, state, official_status, "
                f"citizen_verified_status, photo_evidence_url, created_at) "
                f"VALUES ({id_val}, {proj_val}, {cont_val}, {reg_val}, {amt_val}, {lat_val}, {lng_val}, "
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

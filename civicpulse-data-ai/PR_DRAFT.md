PR: dataprocess — Add processed data assets

Summary
- Adds processed data exports and handoff artifacts for CivicPulse data analytics layer.
- Files included: cleaned budget CSV, contracts CSV (single verified anchor), demo summary JSON, EDA notebook, and handoff notes.

Files to review
- civicpulse-data-ai/data/processed/clean_budget_data.csv
- civicpulse-data-ai/data/processed/contracts_dataset.csv
- civicpulse-data-ai/data/processed/demo_summary.json
- civicpulse-data-ai/notebooks/budget_eda.ipynb
- civicpulse-data-ai/handoff_summary.md
- civicpulse-data-ai/abdulhammed_backend_message.md

Notes & important constraints
- Evidence-only: no fabricated figures. Missing values are marked as "PLACEHOLDER".
- `clean_budget_data.csv`: 421 data rows (checked). Numeric fields `allocated_ngn` and `actual_ngn` parse correctly.
- `contracts_dataset.csv`: 1 data row (verified anchor). Column header `awarded_amount_ngn` present; value fields may be PLACEHOLDER or empty. Additional verified contract rows require sourcing from public procurement portals.
- Provenance included in `sources_json` fields; downstream owners should preserve them when loading into DB.

Checklist before merge
- [ ] Team review: Muiz & Abdulhammed review assets and provenance.
- [ ] Abdulhammed to load CSVs into DB and confirm schema mapping.
- [ ] If expanding `contracts_dataset.csv`, only add rows with verifiable public sources (NOCOPO/BPP/Tracka) and include `sources_json`.
- [ ] Tag release or create a zip of assets for external handoff (optional).

Suggested PR description (copy into GitHub PR body)
This PR adds the curated civicpulse data analytics layer outputs:
- `clean_budget_data.csv` — cleaned budget allocations with provenance and labeled estimated actuals where MDA-level actuals are unavailable.
- `contracts_dataset.csv` — conservative contracts dataset with one verified anchor row; fields left as PLACEHOLDER where evidence is absent.
- `demo_summary.json` — lightweight frontend fallback for demos.
- `notebooks/budget_eda.ipynb` — exploratory analysis used to validate data.

Notes for reviewers
- Do not assume missing values are fabricated; any `PLACEHOLDER` indicates verifiable data was not found.
- The backend owner (Abdulhammed) should confirm field mappings before ingesting to production DB.

Next steps (I can do these):
- Finalize PR body and create the GitHub PR for `data-process` → `main`.
- Expand `contracts_dataset.csv` using verifiable procurement sources.
- Package assets for handoff.

-- Automated draft created by assistant --

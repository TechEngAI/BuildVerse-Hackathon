-- 001_initial_schema.sql
-- Supabase migration to create budget_records and contracts tables

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create budget_records table
CREATE TABLE IF NOT EXISTS budget_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry TEXT NOT NULL,
    state TEXT NOT NULL,
    lga TEXT NOT NULL,
    year INTEGER NOT NULL,
    line_item TEXT NOT NULL,
    allocated_ngn NUMERIC(20, 2) NOT NULL,
    actual_ngn NUMERIC(20, 2) NOT NULL,
    deviation_pct NUMERIC(10, 4),
    alert_fired BOOLEAN NOT NULL DEFAULT FALSE,
    alert_severity TEXT NOT NULL DEFAULT 'none',
    sources_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for budget_records performance
CREATE INDEX IF NOT EXISTS idx_budget_records_ministry ON budget_records(ministry);
CREATE INDEX IF NOT EXISTS idx_budget_records_year ON budget_records(year);
CREATE INDEX IF NOT EXISTS idx_budget_records_alert_fired ON budget_records(alert_fired);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    contractor_name TEXT NOT NULL,
    contractor_reg_number TEXT NOT NULL,
    awarded_amount_ngn NUMERIC(20, 2) NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    lga TEXT NOT NULL,
    state TEXT NOT NULL,
    official_status TEXT NOT NULL,
    citizen_verified_status TEXT NOT NULL,
    photo_evidence_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for contracts performance (including spatial filters)
CREATE INDEX IF NOT EXISTS idx_contracts_state ON contracts(state);
CREATE INDEX IF NOT EXISTS idx_contracts_citizen_verified_status ON contracts(citizen_verified_status);
CREATE INDEX IF NOT EXISTS idx_contracts_location ON contracts(location_lat, location_lng);

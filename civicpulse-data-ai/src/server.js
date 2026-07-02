const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

const BUDGET_CSV_PATH = path.join(__dirname, '../data/processed/clean_budget_data.csv');
const CONTRACTS_CSV_PATH = path.join(__dirname, '../data/processed/contracts_dataset.csv');

// Helper to parse Budget CSV
function loadBudgetData() {
    try {
        if (!fs.existsSync(BUDGET_CSV_PATH)) {
            console.error("Budget CSV not found at:", BUDGET_CSV_PATH);
            return [];
        }
        const fileContent = fs.readFileSync(BUDGET_CSV_PATH, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        return records.map(r => {
            let sourcesObj = {};
            try {
                if (r.sources_json) {
                    sourcesObj = JSON.parse(r.sources_json);
                }
            } catch (err) {
                sourcesObj = { type: "unknown", raw: r.sources_json };
            }

            return {
                id: r.id,
                ministry: r.ministry,
                state: r.state,
                lga: r.lga,
                year: parseInt(r.year, 10) || 0,
                line_item: r.line_item,
                allocated_ngn: parseFloat(r.allocated_ngn) || 0.0,
                actual_ngn: parseFloat(r.actual_ngn) || 0.0,
                deviation_pct: r.deviation_pct === 'PLACEHOLDER' || r.deviation_pct === '' ? null : parseFloat(r.deviation_pct),
                alert_fired: r.alert_fired.toLowerCase() === 'true',
                alert_severity: r.alert_severity,
                sources_json: sourcesObj,
                created_at: r.created_at
            };
        });
    } catch (err) {
        console.error("Error reading budget CSV:", err);
        return [];
    }
}

// Helper to parse Contracts CSV
function loadContractsData() {
    try {
        if (!fs.existsSync(CONTRACTS_CSV_PATH)) {
            console.error("Contracts CSV not found at:", CONTRACTS_CSV_PATH);
            return [];
        }
        const fileContent = fs.readFileSync(CONTRACTS_CSV_PATH, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        return records.map(r => {
            return {
                id: r.id,
                project_name: r.project_name,
                contractor_name: r.contractor_name,
                contractor_reg_number: r.contractor_reg_number,
                awarded_amount_ngn: parseFloat(r.awarded_amount_ngn) || 0.0,
                location_lat: r.location_lat === 'PLACEHOLDER' || r.location_lat === '' || !r.location_lat ? null : parseFloat(r.location_lat),
                location_lng: r.location_lng === 'PLACEHOLDER' || r.location_lng === '' || !r.location_lng ? null : parseFloat(r.location_lng),
                lga: r.lga,
                state: r.state,
                official_status: r.official_status,
                citizen_verified_status: r.citizen_verified_status,
                photo_evidence_url: r.photo_evidence_url,
                created_at: r.created_at
            };
        });
    } catch (err) {
        console.error("Error reading contracts CSV:", err);
        return [];
    }
}

// 1. GET /budget?ministry=&year=&alert_fired=
app.get('/budget', (req, res) => {
    let data = loadBudgetData();
    const { ministry, year, alert_fired } = req.query;

    if (ministry) {
        const queryMin = ministry.toLowerCase();
        data = data.filter(r => r.ministry.toLowerCase().includes(queryMin));
    }
    if (year) {
        const queryYear = parseInt(year, 10);
        data = data.filter(r => r.year === queryYear);
    }
    if (alert_fired) {
        const queryAlert = alert_fired.toLowerCase() === 'true';
        data = data.filter(r => r.alert_fired === queryAlert);
    }

    res.json(data);
});

// 2. GET /contracts?state=&citizen_verified_status=
app.get('/contracts', (req, res) => {
    let data = loadContractsData();
    const { state, citizen_verified_status } = req.query;

    if (state) {
        const queryState = state.toLowerCase();
        data = data.filter(r => r.state.toLowerCase() === queryState || r.state.toLowerCase().includes(queryState));
    }
    if (citizen_verified_status) {
        const queryStatus = citizen_verified_status.toLowerCase();
        data = data.filter(r => r.citizen_verified_status.toLowerCase() === queryStatus);
    }

    res.json(data);
});

// 3. GET /alerts (rows where alert_fired = true, sorted by severity)
app.get('/alerts', (req, res) => {
    let data = loadBudgetData();
    
    // Filter alerts
    let alerts = data.filter(r => r.alert_fired === true);

    // Sorting weights: critical -> high -> medium -> low -> others
    const severityWeights = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1,
        'none': 0,
        'placeholder': 0
    };

    alerts.sort((a, b) => {
        const aWeight = severityWeights[a.alert_severity.toLowerCase()] || 0;
        const bWeight = severityWeights[b.alert_severity.toLowerCase()] || 0;
        return bWeight - aWeight; // Descending order (highest severity first)
    });

    res.json(alerts);
});

app.listen(PORT, () => {
    console.log(`CivicPulse Backend API running on http://localhost:${PORT}`);
});

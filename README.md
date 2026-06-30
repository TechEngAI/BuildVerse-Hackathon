# CivicPulse Backend — 2-Day Build Skeleton

## What's already done
- FastAPI app with 4 working routers: `ghost`, `budget`, `foi`, `reality`
- All endpoints call Claude API directly (no custom ML training needed)
- Supabase schema (`schema.sql`) — minimal, only the fields these 4 features need

## Setup (do this first)
```bash
cd civicpulse-backend
pip install -r requirements.txt
cp .env.example .env
# fill in .env with your real Supabase URL/key and Anthropic API key
```

Run `schema.sql` in your Supabase SQL editor to create the tables.

Start the server:
```bash
uvicorn app.main:app --reload
```
Visit `http://localhost:8000/docs` — FastAPI auto-generates a test UI for every endpoint. Use this to test before Muiz wires up the frontend.

## Endpoints
| Feature | Method | Path |
|---|---|---|
| Ghost Project | POST | `/ghost/analyze-photo` (multipart: file, lat, lng) |
| Budget Tracker | POST | `/budget/upload-pdf` then `/budget/calculate-deviation` |
| FOI Generator | POST | `/foi/generate` (JSON: question, category) |
| Reality Checker | POST | `/reality/report`, GET `/reality/score/{program_name}` |

## What YOU still need to do (in priority order)
1. **Seed `contracts` table with real data** — Ghost Project can't match anything without contract rows in the DB. Add at least 1 real contract with lat/lng near your demo photo's GPS coords.
2. **Get your demo budget PDF** — Delta State 2020 COVID budget is the one referenced throughout your docs (₦50.13B allocated vs ₦4.92B actual). Either find the real PDF or hardcode those two numbers directly into `/budget/calculate-deviation` for the demo.
3. **Test Ghost Project with a real photo** — take/find a photo of an unfinished structure, confirm Claude Vision's completion_pct estimate looks reasonable. Adjust the prompt in `ghost.py` if results are off.
4. **Deploy to Railway** — push this repo, set the 3 env vars in Railway's dashboard, get your live URL to Muiz.
5. **Cache demo responses** — once you've run the real demo case through each endpoint successfully, save the JSON responses somewhere (even a local file) as a fallback in case the live API is slow during judging.

## What was deliberately left out (don't build these in 2 days)
- PostGIS GPS matching — using a simple lat/lng bounding box instead, good enough for a demo
- Z-score anomaly ML model — replaced with simple percentage math, Claude explains it
- spaCy NER — not used since Promise Tracker isn't in scope
- Offline sync / IndexedDB — frontend-only concern anyway, and out of scope for the 4 chosen features
- Redis caching — fine to skip unless Day 2 goes faster than expected

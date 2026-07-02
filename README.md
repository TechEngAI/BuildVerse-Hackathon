# CivicPulse

CivicPulse is a FastAPI backend for civic transparency workflows in Nigeria. It combines authentication, budget transparency, ghost-project tracking, FOI request generation, and public social-program reality checks into a single API that can be used by a web frontend or mobile client.

## Tech Stack

- FastAPI for the API layer
- Supabase for authentication and data storage
- Grok (xAI) for AI-generated summaries and FOI letters
- Redis/Upstash for lightweight caching in the live demo
- Uvicorn for deployment

## Features

- Auth: signup, OTP verification, login, password-reset request, and token refresh
- Budget Tracker: budget deviation analysis and AI summary generation
- Ghost Project Tracker: citizen photo analysis and contract-matching support
- FOI Generator: AI-assisted FOI request letter generation for public accountability workflows
- Reality Checker: public social-program verification reporting and scoring

## Environment Setup

1. Create a Python virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Copy the example environment file and fill in the real values:
   ```bash
   copy .env.example .env
   ```
3. Set the required environment variables in .env:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - XAI_API_KEY
   - UPSTASH_REDIS_URL (optional for caching, but recommended for demo performance)
   - ALLOWED_ORIGINS (optional, defaults to `*`)
4. Run the API locally:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoint Summary

| Router | Method | Path | Auth required | Description |
|---|---|---|---|---|
| Auth | POST | /auth/signup | No | Create an account and trigger signup verification |
| Auth | POST | /auth/verify-otp | No | Verify the emailed OTP and receive session tokens |
| Auth | POST | /auth/login | No | Sign in with email and password |
| Auth | POST | /auth/forgot-password | No | Request a password reset email |
| Auth | POST | /auth/refresh-token | No | Refresh access and refresh tokens |
| Budget | POST | /budget/calculate-deviation | Yes | Calculate a budget deviation and generate AI summaries |
| Budget | POST | /budget/upload-pdf | Yes | Upload a budget PDF for text extraction |
| Ghost | POST | /ghost/analyze-photo | Yes | Analyze a citizen-submitted photo and detect contradictions |
| Ghost | POST | /ghost/contracts/seed | Yes | Temporary helper endpoint for seeding demo contracts; remove before final submission |
| Ghost | GET | /ghost/reports | Yes | List citizen reports and matched contract context |
| Ghost | GET | /ghost/reports/{report_id} | Yes | Return one report by id |
| FOI | POST | /foi/generate | Yes | Generate and store an FOI request letter |
| FOI | GET | /foi/requests | Yes | List the authenticated user’s FOI requests |
| FOI | GET | /foi/requests/{request_id} | Yes | Retrieve one FOI request by id |
| Reality | POST | /reality/report | Yes | Submit a program verification report |
| Reality | GET | /reality/score/{program_name} | No | Return public reality score data for a program |
| Reality | GET | /reality/programs | No | Return the available public program names |
| System | GET | /health | No | Check application health and dependency connectivity |

## Deployment

The API is ready for deployment on Railway with a Procfile and deployment instructions in DEPLOYMENT.md.

## Live URL

Live URL: TBD — set this after the first Railway deployment.

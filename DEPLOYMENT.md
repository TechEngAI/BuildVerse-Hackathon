# Railway Deployment Guide

## 1. Prepare the project

1. Ensure the app dependencies are installed locally:
   ```bash
   pip install -r requirements.txt
   ```
2. Confirm the app runs locally:
   ```bash
   uvicorn app.main:app --reload
   ```

## 2. Configure environment variables in Railway

> Warning: if ALLOWED_ORIGINS is left unset, the app defaults to `*`, which is permissive and allows any origin. Before the final demo or submission, set ALLOWED_ORIGINS to the actual deployed frontend URL (or a small allowlist of approved origins) to avoid an unnecessarily open configuration.

Add the following variables in the Railway dashboard under Variables:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- XAI_API_KEY
- UPSTASH_REDIS_URL
- ALLOWED_ORIGINS
- DEBUG
- PORT

Use the same values as your local .env file, except PORT is provided automatically by Railway.

## 3. Deploy the app

1. Connect the repository to Railway.
2. Choose the service and trigger a new deploy from the main branch.
3. Railway will use the Procfile to start the app with:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

## 4. Get the live URL

After the build succeeds, Railway will provide a public domain for the service. Share that URL with the frontend team.

## 5. Verify the deployment

Open the health endpoint:

```text
https://<your-railway-domain>/health
```

You should receive a JSON response with the application status and the Supabase/Redis connection state.

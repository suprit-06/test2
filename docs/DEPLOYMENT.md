# SpendWise Deployment Guide

This guide keeps deployment familiar by supporting the most common paths: Docker, Railway/Render style Node services, and Vercel for the Next.js frontend.

## Required Environment Variables

### API

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/spendwise?schema=public` | PostgreSQL connection string. |
| `JWT_SECRET` | Yes | `use-a-long-random-secret` | Use a strong production-only secret. |
| `PORT` | Platform | `4000` | Most hosts inject this automatically. Falls back to `API_PORT`. |
| `API_PORT` | Local only | `4000` | Used when `PORT` is not set. |
| `CORS_ORIGIN` | Yes | `https://your-web.vercel.app` | Comma-separate multiple frontend origins. |

### Web

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | `https://your-api.railway.app/api` | Browser-visible API base URL. |
| `SPENDWISE_API_TOKEN` | Optional | `eyJ...` | Server-side dashboard token for private demos. |
| `SPENDWISE_DEMO_EMAIL` | Optional | `demo@spendwise.local` | Demo login fallback. |
| `SPENDWISE_DEMO_PASSWORD` | Optional | `SpendWise123` | Demo login fallback. |

## Option A — Docker Compose Production Preview

```bash
docker compose -f docker-compose.prod.yml up --build
```

Then run migrations in the API container:

```bash
docker compose -f docker-compose.prod.yml exec api npm run db:deploy --workspace apps/api
```

Open:

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/api/health`

## Option B — Deploy API with Docker

Build from the repository root:

```bash
docker build -f apps/api/Dockerfile -t spendwise-api .
docker run --env-file .env -p 4000:4000 spendwise-api
```

Run migrations before serving production traffic:

```bash
npm run db:deploy --workspace apps/api
```

## Option C — Deploy Web with Docker

Build from the repository root and pass the deployed API URL:

```bash
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.example.com/api \
  -t spendwise-web .
docker run -e PORT=3000 -p 3000:3000 spendwise-web
```

## Option D — Vercel Web + Railway/Render API

### Web on Vercel

1. Import the repository into Vercel.
2. Set the project root to `apps/web`; the `apps/web/vercel.json` file contains the familiar Next.js build commands.
3. Set `NEXT_PUBLIC_API_URL` to the deployed API URL ending in `/api`.
4. Deploy.

### API on Railway/Render

1. Create a PostgreSQL database.
2. Create a Node or Docker service from this repository.
3. If using Docker, set the Dockerfile path to `apps/api/Dockerfile`.
4. Set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`.
5. Run the release command `npm run db:deploy --workspace apps/api`.
6. Start command: `npm run start --workspace apps/api`.

## Heroku-style Procfile

The root `Procfile` is API-focused:

```text
web: npm run start --workspace apps/api
release: npm run db:deploy --workspace apps/api
```

Use Vercel or the web Dockerfile for the frontend.

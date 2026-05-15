# SpendWise — Personal Finance & Expense Analytics Platform

SpendWise is a production-oriented full-stack finance platform for tracking income, expenses, budgets, recurring payments, and analytics insights. It uses a modular monolithic architecture with a Next.js frontend, Express REST API, PostgreSQL database, and Prisma ORM.

## Mature Project Prompt

Build **SpendWise**, a secure and scalable personal finance analytics platform that helps users understand and improve their financial behavior. The application must support authenticated users, income and expense tracking, category management, monthly budgets, recurring payments, transaction search/filtering, CSV export, and a responsive analytics dashboard with charts for category distribution, monthly trends, income versus expense, and budget utilization. The system should follow clean software engineering practices, including protected APIs, ownership checks, relational schema design, backend aggregation queries, reusable UI components, environment-based configuration, and production-ready documentation.

## Exact File Structure

```text
spendwise/
├── .dockerignore
├── .env.example
├── .gitignore
├── Procfile
├── README.md
├── docker-compose.prod.yml
├── docker-compose.yml
├── docs/
│   ├── DEPLOYMENT.md
│   └── REPORT.md
├── package.json
├── scripts/
│   └── dev.mjs
└── apps/
    ├── api/
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   ├── src/
    │   │   ├── app.ts
    │   │   ├── config/
    │   │   │   ├── env.ts
    │   │   │   └── prisma.ts
    │   │   ├── middleware/
    │   │   │   ├── auth.ts
    │   │   │   └── error.ts
    │   │   ├── routes/
    │   │   │   ├── auth.routes.ts
    │   │   │   └── finance.routes.ts
    │   │   ├── server.ts
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   └── finance.service.ts
    │   │   └── utils/
    │   │       ├── auth.ts
    │   │       ├── errors.ts
    │   │       └── http.ts
    │   └── tsconfig.json
    └── web/
        ├── .eslintrc.json
        ├── Dockerfile
        ├── next-env.d.ts
        ├── next.config.mjs
        ├── package.json
        ├── postcss.config.js
        ├── public/
        │   └── .gitkeep
        ├── src/
        │   ├── app/
        │   │   ├── globals.css
        │   │   ├── layout.tsx
        │   │   └── page.tsx
        │   ├── components/
        │   │   ├── Charts.tsx
        │   │   └── StatCard.tsx
        │   └── lib/
        │       └── api.ts
        ├── tailwind.config.ts
        ├── tsconfig.json
        └── vercel.json
```

## Local Setup

### 1. Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ or Docker

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Update `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` if your local setup differs from the example. `CORS_ORIGIN` accepts comma-separated deployed web origins, and cloud platforms can provide `PORT` instead of `API_PORT`. The demo dashboard can authenticate against the seeded account with `SPENDWISE_DEMO_EMAIL` and `SPENDWISE_DEMO_PASSWORD`.

### 4. Start PostgreSQL

```bash
docker compose up -d postgres
```

If you already have PostgreSQL running locally, skip Docker and use your own connection string.

### 5. Prepare the database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed command creates a demo account:

- Email: `demo@spendwise.local`
- Password: `SpendWise123`

### 6. Run the full stack locally

```bash
npm run dev
```

- Web app: <http://localhost:3000>
- API health check: <http://localhost:4000/api/health>

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a user account |
| `POST` | `/api/auth/login` | Authenticate and return a JWT |
| `GET` | `/api/dashboard` | Return summary cards and chart data |
| `GET` | `/api/transactions` | List searchable/filterable transactions |
| `POST` | `/api/transactions` | Create income or expense transaction |
| `PATCH` | `/api/transactions/:id` | Update a user-owned transaction |
| `DELETE` | `/api/transactions/:id` | Delete a user-owned transaction |
| `GET` | `/api/transactions/export.csv` | Export filtered transactions as CSV |
| `GET` | `/api/categories` | List user categories |
| `POST` | `/api/categories` | Create a category |
| `GET` | `/api/budgets` | List monthly budgets |
| `PUT` | `/api/budgets` | Create or update a category budget |
| `GET` | `/api/recurring` | List recurring payments |
| `POST` | `/api/recurring` | Create a recurring payment |
| `PATCH` | `/api/recurring/:id` | Update a recurring payment |

Protected endpoints require `Authorization: Bearer <token>`.

## Production Hardening and Optimization

- JWT-protected finance APIs with user ownership checks before transaction and budget mutations.
- Indexed database fields for user/date/type/category queries and recurring payment scheduling.
- Backend aggregation for dashboard charts to reduce frontend computation.
- Shared Prisma client to avoid excessive database connections.
- Zod validation for environment variables, request bodies, and query strings.
- Centralized async error handling with clean validation, authorization, conflict, and not-found responses.
- Root development runner implemented with Node.js instead of a third-party process manager.
- Responsive chart cards and reusable stat cards in the UI.
- Demo fallback data so the frontend can be previewed before API setup.

## Deployment Notes

Deployment-friendly files are included for familiar hosting flows: `apps/api/Dockerfile`, `apps/web/Dockerfile`, `docker-compose.prod.yml`, `Procfile`, and `apps/web/vercel.json`. See `docs/DEPLOYMENT.md` for Docker, Vercel, Railway, Render, and Heroku-style steps.

- Deploy `apps/web` to Vercel and set `NEXT_PUBLIC_API_URL` to the deployed API URL.
- Deploy `apps/api` to Railway or Render with PostgreSQL and set `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `CORS_ORIGIN`.
- Prefer a long random `JWT_SECRET` in production.
- Run production Prisma migrations during deployment with `npm run db:deploy --workspace apps/api` or your platform's release command.

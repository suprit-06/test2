# SpendWise Project Report

## 1. Objective

SpendWise was prepared as a production-style full-stack personal finance and expense analytics platform. The goal was to demonstrate authentication, API design, relational database modeling, backend analytics aggregation, responsive UI engineering, optimization, and maintainable documentation.

## 2. Step-by-Step Development Process

### Step 1 — Requirements refinement

The original idea was structured into a mature product specification covering users, transactions, categories, budgets, recurring payments, dashboards, exports, alerts, and future AI insights.

### Step 2 — Architecture selection

A modular monolith was selected because it keeps deployment simple while preserving clean boundaries between the web app, API, database schema, middleware, services, routes, and utilities.

### Step 3 — Repository structure

A workspace-based monorepo was created with two applications:

- `apps/api` for Node.js, Express, Prisma, and PostgreSQL.
- `apps/web` for Next.js, Tailwind CSS, and Recharts.

### Step 4 — Database design

The Prisma schema defines users, categories, transactions, budgets, and recurring items. Indexes were added for high-traffic access patterns such as user transaction history, transaction type filtering, monthly budget lookup, and recurring payment scheduling.

### Step 5 — Backend implementation

The backend was split into focused layers:

- `config` for validated environment variables and the Prisma client.
- `middleware` for authentication and error handling.
- `routes` for HTTP endpoint definitions.
- `services` for business logic, ownership checks, validation, CSV export, and aggregation queries.
- `utils` for password hashing, JWT helpers, reusable HTTP wrappers, and domain errors.

### Step 6 — Production debugging and hardening

The initial scaffold was improved by removing the external concurrent process dependency, excluding Prisma seed files from the API production TypeScript build, adding async route handling, adding Prisma-aware error responses, enforcing category ownership checks, normalizing dashboard dates and Decimal values, and expanding finance APIs beyond read-only examples.

### Step 7 — Analytics implementation

The dashboard API computes total income, total expenses, balance, category distribution, budget utilization, monthly trend data, and upcoming recurring payments. Aggregation is performed on the server so the frontend receives chart-ready data.

### Step 8 — Frontend implementation

The frontend includes a modern fintech-style dashboard with summary cards, bar chart analytics, pie chart category distribution, budget progress bars, and recurring payment cards. Components are responsive and reusable. The frontend can use live API data through a token or demo login credentials, and it falls back to safe demo data when the API is unavailable.

### Step 9 — Documentation and local run instructions

The README documents prerequisites, installation, environment setup, database commands, runtime commands, API endpoints, file structure, optimization decisions, and deployment notes.

## 3. Exact File Structure

```text
spendwise/
├── .env.example
├── .gitignore
├── README.md
├── docker-compose.yml
├── docs/
│   └── REPORT.md
├── package.json
├── scripts/
│   └── dev.mjs
└── apps/
    ├── api/
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
        ├── next-env.d.ts
        ├── next.config.mjs
        ├── package.json
        ├── postcss.config.js
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
        └── tsconfig.json
```

## 4. How to Run Locally

1. Install Node.js 20+, npm 10+, and PostgreSQL 15+ or Docker.
2. Run `npm install` from the repository root.
3. Run `cp .env.example .env`.
4. Update `DATABASE_URL` and `JWT_SECRET` in `.env`.
5. Run `docker compose up -d postgres` or start your own PostgreSQL server.
6. Run `npm run db:generate`.
7. Run `npm run db:migrate`.
8. Run `npm run db:seed`.
9. Run `npm run dev`.
10. Open `http://localhost:3000`.
11. Confirm the API at `http://localhost:4000/api/health`.

## 5. Main Code Comments

Main areas of the codebase include comments explaining why configuration validation, Prisma client sharing, authentication middleware, async route handling, indexed transaction queries, backend aggregation, frontend demo fallback data, and responsive chart containers are used.

## 6. Debugging and Optimization Summary

- Removed the `concurrently` dependency and replaced it with `scripts/dev.mjs`.
- Fixed the API TypeScript build scope so production builds do not compile Prisma seed scripts under the wrong root directory.
- Added route-level async error forwarding and centralized domain error handling.
- Added ownership checks so users cannot create transactions or budgets with another user's category.
- Added update/delete transaction endpoints, category creation, budget upsert/listing, recurring payment create/update/listing, and CSV export.
- Expanded seed data to include historical trend data, budgets, and recurring payments.
- Normalized dashboard response fields for frontend chart compatibility.
- Added `.eslintrc.json` to avoid interactive Next.js lint setup prompts.

## 7. Future Enhancements

- Add PDF report generation.
- Add email and in-app budget alerts.
- Add automated recurring transaction materialization.
- Add dark mode toggle persistence.
- Add AI-powered spending recommendations.
- Add automated unit and integration test suites once package installation is available in the execution environment.

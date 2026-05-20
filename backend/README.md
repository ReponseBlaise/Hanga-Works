Backend scaffold (TypeScript + Express + Prisma)

Quick start

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure database

Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres database.

3. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start in dev mode

```bash
npm run dev
```

API

- `GET /health` health check
- `GET /users` list users
- `POST /users` create user { name, email }

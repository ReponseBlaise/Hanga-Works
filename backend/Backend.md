# Hanga-Works Backend

## Deployment (Render)

The backend is configured to deploy automatically on Render. The build process is managed by `build.js` which:
1. Pins Prisma and `@prisma/client` to version `5.22.0`.
2. Generates the Prisma Client.
3. Runs `prisma migrate deploy`.
4. Automatically handles the `P3005` error by baselining the initial migration if the database is not empty.
5. Compiles the TypeScript code.

### Build Command
`npm run build` (runs `node build.js`)

### Environment Variables
Required environment variables on Render:
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key for token signing.
- `PORT`: Defaults to 5000.

## Local Development

1. `npm install`
2. `cp .env.example .env`
3. `npx prisma migrate dev`
4. `npm run dev`

Commit: fix(frontend): add Vite env types for import.meta.env

- Added `frontend/vite-env.d.ts` to declare `ImportMetaEnv` and `ImportMeta` so
  TypeScript recognizes `import.meta.env.VITE_API_BASE` during `npm run build`.
- This resolves the Vercel build error: `Property 'env' does not exist on type 'ImportMeta'`.

Notes:
- If you rely on additional VITE_ variables, add them to `ImportMetaEnv` here.
- After pulling, run:

```bash
cd frontend
npm ci
npm run build
```

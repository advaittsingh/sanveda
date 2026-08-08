# Sanveda

Three-folder layout (one git repo, one Vercel project, same-origin `/api`):

```
website/   # Public Vite SPA
admin/     # Admin Vite SPA (served at /admin/)
backend/   # Vercel serverless API + DB migrations
api -> backend/api   # symlink so Vercel maps /api/*
```

## Develop

```bash
npm install
npm run dev:website   # http://localhost:5173
npm run dev:admin     # http://localhost:5174/admin/
npm run dev:all       # both
```

API: run `vercel dev` (or deploy) so `/api` is available. Vite proxies `/api` → `http://127.0.0.1:3000`.

## Build / deploy

```bash
npm run build         # website + admin → dist/ + dist/admin/
npm run deploy:prod
```

## Database

```bash
npm run db:migrate
npm run verify:migrations
```

Env files stay at the **repo root** (`.env`, `.env.local`).

# API Explorer (MVP)

A web app that takes an API base URL and optional API key, introspects the API (OpenAPI/Swagger or GraphQL where possible), and renders a visual + browsable map of endpoints/types.

> Scaffold generated 2025-08-10. Stack: Next.js (App Router) + TypeScript.

## Quick start

```bash
# 1) Install deps
npm install

# 2) Run locally
npm run dev
# open http://localhost:3000
```

## Deploy

- **Vercel** (recommended): import the repo, keep defaults. No server secrets needed for the MVP.
- **Other hosts**: any Node host that supports Next.js.

## How it works

- Client posts `baseUrl` and optional auth info (`apiKey`, `headerName`, `authScheme`) to `/api/introspect`.
- Server tries in order:
  1. **OpenAPI/Swagger**: fetches `/.well-known/openapi.json`, `/openapi.json`, `/swagger.json`, `/v1/openapi.json`.
  2. **GraphQL**: runs an **introspection query** against the given URL.
  3. **Fallback**: makes a lightweight `GET baseUrl` and attempts to classify JSON shape (very limited in MVP).
- Result is normalized and rendered in the UI.

### Security notes

- API keys are **never logged**. In the MVP they are sent only to your serverless function and applied to requests using your chosen header and scheme (e.g. `Authorization: Bearer …`).
- For production, prefer per‑session secrets and a denylist/allowlist of outbound domains. Do not persist user-provided keys by default.

## Project structure

```
api-explorer/
├─ app/
│  ├─ api/introspect/route.ts     # server: detects OpenAPI/GraphQL and returns a normalized schema
│  ├─ globals.css                  # minimal styles
│  ├─ layout.tsx                   # base layout
│  └─ page.tsx                     # UI: form + rendered results
├─ components/
│  ├─ ApiForm.tsx                  # URL/auth form
│  └─ Explorer.tsx                 # renders an outline of the API shape
├─ lib/
│  └─ introspect/
│     ├─ openapi.ts                # OpenAPI/Swagger fetch helpers
│     ├─ graphql.ts                # GraphQL introspection helpers
│     └─ util.ts                   # shared helpers
├─ public/
│  └─ favicon.svg
├─ .github/
│  └─ workflows/ci.yml             # build + lint on PRs
├─ .env.local.example
├─ next.config.mjs
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Roadmap (suggested issues)

- [ ] Render an interactive **endpoint -> schema** tree.
- [ ] Add simple **graph view** (React Flow or Cytoscape).
- [ ] Support **API-key-in-query** and **custom header** schemes.
- [ ] Cache introspection results (LRU) to reduce outbound calls.
- [ ] Add **rate limiting** and target allowlist for the proxy.
- [ ] Add **JSON:API** and **HAL** detectors.
- [ ] Add **Postman collection** export.
- [ ] Save named API profiles (per-user) with encrypted secrets.

See `codex.md` for suggested Codex tasks and PRs.

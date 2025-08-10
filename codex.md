# Codex playbook for this repo

This file contains ready-to-run tasks you can paste into ChatGPT → Codex.

---

## 1) Implement JSON:API + HAL detectors
**Task:** Extend `/api/introspect` to recognize JSON:API and HAL responses and return a normalized map of resources/links.
**Notes:** Add `lib/introspect/jsonapi.ts` and `lib/introspect/hal.ts`. Unit tests appreciated.
**Acceptance Criteria:**
- Detect `application/vnd.api+json` content-type.
- Detect `_links` and `_embedded` for HAL.
- Return `{ kind: 'jsonapi' | 'hal', resources: [...], links: [...] }`.

## 2) Add endpoint graph visualization
**Task:** Create a simple graph view using React Flow that clusters routes by tag/path segment.
**Notes:** New component `components/Graph.tsx` and toggle in UI.
**Acceptance Criteria:**
- Graph renders for OpenAPI inputs with ≥ 10 endpoints.
- Zoom/pan and node click -> highlight endpoint in list.

## 3) Support custom auth schemes
**Task:** Allow user to choose header name and token scheme (Bearer, Basic, custom).
**Notes:** Update `ApiForm` and auth util.
**Acceptance Criteria:**
- Requests send correct headers.
- UI persists choice per session (localStorage).

## 4) Rate limiting & allowlist
**Task:** Implement per-IP rate limiting for `/api/introspect` and optional host allowlist via env var.
**Notes:** Keep it simple; store counters in-memory for MVP.
**Acceptance Criteria:**
- 429 when exceeding X/min (configurable).
- Requests to disallowed hosts rejected with 403.

## 5) OpenAPI deep-dive
**Task:** Extract schemas and render a tree for components/schemas with $ref resolution.
**Acceptance Criteria:**
- List top-level schemas and their fields.
- Link from endpoint request/response -> schema node.

# AI FAQ Memory Assistant

## Setup

```bash
pnpm install
pnpm dev          # next dev --turbopack
pnpm build        # next build
pnpm lint         # next lint
```

Environment (`.env`): `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `OPENAI_API_KEY`.

## Architecture

- **Next.js 15 App Router**, TypeScript strict, Tailwind v4, pnpm monorepo (single workspace)
- **Redis 8** with RediSearch + RedisJSON modules (`FT.CREATE`, `FT.SEARCH`, `JSON.SET`)
- **OpenAI** `text-embedding-3-small` for vector embeddings, `gpt-4o` for answers (LangChain.js)

## API endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/create-index` | **Broken** — vector/result index creation commented out (no-op) |
| POST | `/api/ingest` | Accepts `[{question, answer}]` array, stores as `vector:<sha256>` |
| POST | `/api/list` | POST (not GET). Body `{index: "idx:faq_result"}`. Returns last 10 sorted by `createdAt` desc |
| POST | `/api/ask` | **Referer-gated**: hardcoded to `https://master.d15ripqxac0b7u.amplifyapp.com` — blocks localhost dev |

All API routes create/close their own Redis connection per request.

## Redis schema

| Index | Prefix | Purpose |
|-------|--------|---------|
| `idx:faq_vector` | `vector:` | FA question embeddings (JSON: question, answer, embedding[1536 float32]) |
| `idx:faq_result` | `result:` | Cached answers (JSON: question, answer, source, score, createdAt) |

- Vector index: HNSW, COSINE distance, 1536 dims (OpenAI `text-embedding-3-small`)
- Cache TTL: 60 minutes (hardcoded 60 × 60 seconds in `/api/ask/route.ts:117`)

## Testing

No test framework. Manual testing via `test.rest` (VS Code REST Client extension).

## Deployment

AWS Amplify via `amplify.yml` — injects env vars to `.env.production`, uses `corepack` + `pnpm`.

## Key Gotchas

- `/api/create-index` does nothing — index creation relies on manual CLI or separate script.
- `/api/ask` referer check **blocks curl/localhost**. Remove or relax for dev testing.
- TTL comment says "15 minutes" but code uses `60 * 60` (1 hour).

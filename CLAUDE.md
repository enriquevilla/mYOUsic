# mYOUsic — CLAUDE.md

## Project overview

A music-sharing social media platform. Users register/login, create posts that embed a Spotify track, comment on posts, favorite posts, and follow other users.

**Stack**: Node.js + Express (server), MongoDB via Mongoose (database), TypeScript (compiled), vanilla HTML + Bootstrap 4 (frontend), Spotify Embed + Client Credentials API (music).

## Build & run

```bash
npm install
npm run build   # copies static files, runs tsc + tsc-alias
npm start       # node dist/server.js (port 8080)
```

```bash
npm run rebuild  # clean dist/ then full build
npm run clean    # delete dist/
```

The `dist/` directory is the compiled output — do not edit files there directly.

### Required environment variables (or edit `config.ts`)

| Variable | Default | Description |
|---|---|---|
| `DBURL` | `mongodb://localhost:27017/mYOUsicDB` | MongoDB connection string |
| `PORT` | `8080` | Server port |
| `SECRET_TOKEN` | (placeholder) | JWT signing secret |
| `SPOTIFY_KEY` | (placeholder) | Base64-encoded `clientId:clientSecret` for Spotify |
| `PRODUCTION_MODE` | `true` | Controls static file root (`dist/public` vs `public`) |

> `config.ts` defaults `PRODUCTION_MODE` to `true`, which means `npm start` serves from `dist/public`. This is intentional for the compiled app but confusing during development.

## Architecture

```
server.ts          — Express app: all routes live here (monolithic)
config.ts          — Env var defaults
middleware/
  cors.ts          — CORS middleware
models/
  user-model.ts    — Mongoose schema + query helpers for users
  post-model.ts    — Mongoose schema + query helpers for posts
  comments-model.ts — Mongoose schema + query helpers for comments
public/
  index.html, pages/*.html  — Multi-page frontend (MPA)
  scripts/*.ts     — Client-side TypeScript (compiled into dist/)
  css/index.css    — Styles
dist/              — Compiled output (gitignored)
```

The frontend TypeScript files import server-side model interfaces (e.g. `import { IPostModel } from "#/models/post-model"`) purely for type information. Since TypeScript erases types at compile time, no server code actually runs in the browser — the imports themselves are fine. The problem is that both share the same `tsconfig.json` and are compiled in one pass, meaning there is no enforced boundary between browser and server code. The fix is separate TypeScript projects with a shared `types/` directory, not removing the type imports.

Auth is JWT stored in `localStorage`. The token is read by `validatetoken.ts` on each page load. **Most API routes are not protected server-side** — any request can call `/posts`, `/deleteOwnPosts`, etc. without a valid token.

## Roadmap

> **Workflow:** When completing a roadmap item, mark it `[x]` in the same PR that does the work — don't leave it for a follow-up commit.

This was a university project built quickly under time pressure — code quality was deliberately sacrificed. The goal is a complete ground-up modernization, used as a learning exercise. Everything is on the table.

### Phase 1 — Clean up the existing codebase

Fix all known issues before introducing new technology.

- [ ] Split `server.ts` into route modules (users, posts, comments, etc.)
- [ ] Add auth middleware; protect all mutating routes server-side
- [ ] Replace hardcoded `"admin"` username check with a proper `role: "user" | "admin"` field on the User model, enforced server-side
- [ ] Remove comment approval queue — comments post immediately; post owners and admin can delete comments. Remove `approved` field from Comment and the `/approveComments` page
- [x] Upgrade Mongoose to v8, remove deprecated connection options
- [x] Replace `node-fetch` with native fetch; remove `body-parser`
- [ ] Fix `getPostsByUserList` query
- [ ] Enable TypeScript strict mode; eliminate `any`
- [ ] Move error messages out of `res.statusMessage` into response body
- [x] Remove leftover `console.log` statements

### Phase 2 — Frontend rebuild

Replace the MPA with a proper React SPA.

- [ ] Migrate to React with proper component architecture (Vite as build tool)
- [ ] TypeScript throughout with strict mode
- [ ] React Query (TanStack Query) for server state, caching, and data fetching
- [ ] Responsive design / mobile friendly
- [ ] Skeleton loading states and proper error boundaries
- [ ] Zustand for lightweight client-side state (if needed beyond React Query)
- [ ] Component library — shadcn/ui or a small custom one
- [ ] Frontend unit tests with React Testing Library

### Phase 3 — Backend rebuild

Rebuild the Express API cleanly on top of the Phase 1 cleanup.

- [ ] Well-structured REST API (`/api/v1/` versioning)
- [ ] Request validation with Zod
- [ ] Proper error handling middleware
- [ ] Refresh token rotation for auth (replace naive JWT-in-localStorage)
- [ ] CORS configured properly; Helmet.js for HTTP headers
- [ ] Input sanitization
- [ ] Database indexing done thoughtfully
- [ ] Redis for caching Spotify API responses and rate limiting
- [ ] Rate limiting
- [ ] API documentation with Swagger/OpenAPI
- [ ] End-to-end tests with Playwright
- [ ] Unit and integration tests with Jest
- [ ] Logging with Winston

### Phase 4 — DevOps & infrastructure

- [ ] Environment configuration management (`.env`, secrets handling)
- [ ] Containerize with Docker (separate containers for frontend, backend, database)
- [ ] Docker Compose for local development
- [ ] CI/CD pipeline with GitHub Actions (auto deploy on push)
- [ ] HTTPS enforced on deployment
- [ ] Deploy on AWS (EC2 or ECS)
- [ ] S3 for media and asset storage
- [ ] MongoDB Atlas with proper configuration
- [ ] Nginx as a reverse proxy
- [ ] Separate dev/staging/production environments

### Phase 5 — Stretch goals

Lower priority; tackle if time and interest allow.

- [ ] Error tracking with Sentry
- [ ] Health check endpoint
- [ ] Monitoring dashboard with Grafana + Prometheus
- [ ] Turborepo for monorepo management
- [ ] Terraform for AWS infrastructure as code
- [ ] Kubernetes (basic local cluster with minikube)
- [ ] GraphQL as alternative/complement to REST
- [ ] Bun as JavaScript runtime and package manager
- [ ] Spotify account linking (OAuth Authorization Code flow) — enables Web Playback SDK for Premium users, replacing the embed iframe with a full in-browser player

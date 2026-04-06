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

## Known issues & tech debt (modernization targets)

- **Mongoose v5** — deprecated, uses dead options (`useNewUrlParser`, `useUnifiedTopology`, `useCreateIndex`). Target: Mongoose v8.
- **No auth middleware** — protected routes (create post, delete post, add comment, follow, favorite) do not verify the JWT on the server.
- **`node-fetch` v2** — Node 18+ has native `fetch`; this dependency should be removed.
- **`body-parser` separate** — `express.json()` is available since Express 4.16; the `body-parser` dep is redundant.
- **`getPostsByUserList` is broken** — uses `populate` with `match` which does NOT filter documents at the DB level; it returns all posts and nulls out non-matching users. The query needs `find({ user: { $in: userList } })`.
- **No tests** — `npm test` exits with an error. No test framework is set up.
- **Leftover `console.log`** — JWT tokens, post data, and user IDs are logged to stdout in production paths.
- **`res.statusMessage`** — deprecated in Node 18+; error messages should be in the response body.
- **`any` everywhere** — TypeScript strict mode is not enabled; many model methods and handlers use `any`.
- **No input sanitization** — no validation library; fields are passed directly to Mongoose.
- **`exports = {}` hack in HTML** — workaround for CommonJS/browser compat issue in the compiled scripts.
- **Hardcoded `admin` username** — `index.ts` grants delete access to any user named `"admin"`.
- **Bootstrap 4.5 + jQuery** — outdated; jQuery is only included to satisfy Bootstrap 4.

## Modernization goals (update as we go)

Architecture rewrite — the goal is a complete cleanup, not just patching. This was a university project built quickly under time pressure; code quality was deliberately sacrificed. Everything is on the table.

- [ ] Split `server.ts` into route modules (users, posts, comments, etc.)
- [ ] Add auth middleware; protect all mutating routes server-side
- [ ] Upgrade Mongoose to v8, remove deprecated connection options
- [ ] Replace `node-fetch` with native fetch; remove `body-parser`
- [ ] Fix `getPostsByUserList` query
- [ ] Enable TypeScript strict mode; eliminate `any`
- [ ] Separate frontend and backend TypeScript projects/configs
- [ ] Add a proper frontend build tool (e.g. Vite) instead of the current copy+tsc hack
- [ ] Add input validation (Zod or express-validator)
- [ ] Add a test framework (Vitest or Jest)
- [ ] Move error messages out of `res.statusMessage` into response body
- [ ] Replace hardcoded `"admin"` username check with a proper `role: "user" | "admin"` field on the User model, enforced server-side
- [ ] Remove comment approval queue — comments post immediately; post owners and admin can delete comments instead. Remove `approved` field from Comment model and drop the `/approveComments` page.

# mYOUsic — Feature Specification

## Overview

mYOUsic is a music-sharing social media platform where users share Spotify tracks, comment on posts, save favorites, and follow other users.

---

## Data models

### User
| Field | Type | Notes |
|---|---|---|
| `userName` | string | unique identifier, required |
| `password` | string | bcrypt-hashed, required |
| `following` | ObjectId[] | refs to `users` collection |
| `favorites` | ObjectId[] | refs to `posts` collection |

### Post
| Field | Type | Notes |
|---|---|---|
| `song` | string | Spotify track ID (not a full URL), required |
| `user` | ObjectId | ref to `users`, required |
| `description` | string | user-written caption, required |
| `comments` | ObjectId[] | refs to `comments` collection |

### Comment
| Field | Type | Notes |
|---|---|---|
| `comment` | string | comment text, required |
| `username` | string | author's username (denormalized, not a ref), required |
| `approved` | boolean | moderation flag, required |

---

## API endpoints

All endpoints return JSON. Error responses set `res.statusMessage` (deprecated — to be migrated to response body).

### Auth

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/register` | `{ userName, password }` | 201 user object | Hashes password with bcrypt. Fails if username taken. |
| POST | `/login` | `{ userName, password }` | 200 `{ token }` | Returns a 1-hour JWT. |
| GET | `/validate-token` | — | 200 `{ userName }` | Reads `sessiontoken` header. |

### Posts

| Method | Path | Body / Params | Response | Notes |
|---|---|---|---|---|
| GET | `/allPosts` | — | 200 post[] | All posts, newest-first on client. Populates user + comments. |
| POST | `/posts` | `{ description, song, username }` | 201 post | No server-side auth check. |
| GET | `/posts/:username` | — | 200 post[] | Posts by a specific user. |
| DELETE | `/deleteOwnPosts` | `{ postId }` | 200 | No server-side auth check. |

### Comments

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/addComment` | `{ postID, comment, username }` | 201 comment[] | Auto-approved if commenter owns the post. |
| PATCH | `/approveComment` | `{ commentID }` | 204 | No auth check — any user can approve any comment. |
| DELETE | `/rejectComment` | `{ commentID }` | 200 | No auth check. |

**Target:** Replace `PATCH /approveComment` and `DELETE /rejectComment` with a single `DELETE /comment/:commentID` route, authorized for post owners and admin only. Remove the `approved` field from Comment.

### Favorites

| Method | Path | Body / Params | Response | Notes |
|---|---|---|---|---|
| POST | `/addFavorite` | `{ postId, username }` | 200 | No auth check. |
| POST | `/removeFavorite` | `{ username, postId }` | 204 | No auth check. |
| GET | `/favorites/:username` | — | 200 ObjectId[] | Raw favorite IDs. |
| GET | `/favposts/:username` | — | 200 post[] | Favorites with populated post + user + comments. |

### Social

| Method | Path | Body / Params | Response | Notes |
|---|---|---|---|---|
| POST | `/follow` | `{ username, userToFollow }` | 200 | No auth check. |
| PATCH | `/unfollow` | `{ username, userToUnfollow }` | 204 | No auth check. |
| GET | `/following/:username` | — | 200 user[] | List of followed users with `userName`. |
| GET | `/getPostsFromFollowed/:username` | — | 200 post[] | **Broken** — returns all posts due to incorrect populate+match query. |

### Spotify

| Method | Path | Response | Notes |
|---|---|---|---|
| GET | `/genAccessToken` | 200 `{ access_token, ... }` | Proxies Spotify Client Credentials token request. Exposes token to client. |

---

## Pages & frontend scripts

| Page | Route | Script | Description |
|---|---|---|---|
| Home | `/` | `index.ts` | Feed of all posts. Logged-in users can comment, favorite, follow, delete own posts. |
| About | `/about` | — | Static about page. |
| Login | `/login` | `login.ts` | Login form; stores JWT + username in `localStorage`. |
| Register | `/register` | `register.ts` | Registration form. |
| Create Post | `/createPost` | `createPost.ts` | Search Spotify for a track, write a description, submit. |
| My Profile | `/myProfile` | `myProfile.ts` | Shows current user's posts. |
| Favorites | `/favorites` | `favorites.ts` | Shows current user's favorited posts. |
| Followed User Posts | `/followedUserPosts` | `followedUserPosts.ts` | Posts from followed users (broken — see API note). |
| Approve Comments | `/approveComments` | `approveComments.ts` | Post owner reviews pending comments. **To be removed** — replaced by inline delete buttons on comments. |

### Auth flow (client-side)
1. `validatetoken.ts` runs on every page load, calls `GET /validate-token` with the stored JWT.
2. If the token is invalid/expired, the user is redirected to `/login`.
3. The nav is adjusted by `adjustNav.ts` to show/hide login-dependent links.

### Target auth design (Phase 3)
The current approach (single JWT in `localStorage`, 1-hour expiry) has two problems:
- `localStorage` is accessible to any JavaScript on the page, making the token vulnerable to XSS attacks.
- When the token expires, the user is simply logged out with no way to silently renew the session.

Target: **short-lived access token + refresh token rotation.**
- Access token (e.g. 15 min) stored in memory (React state), never persisted.
- Refresh token (long-lived) stored in an `httpOnly` cookie — inaccessible to JavaScript.
- On access token expiry, the client silently hits a `/auth/refresh` endpoint; the server validates the refresh token cookie and issues a new pair.
- On logout, the refresh token is invalidated server-side.

This requires a server-side refresh token store (Redis is the natural fit, already planned).

### Comment moderation
**Current (to be replaced):** Comments require approval before appearing. Post owners approve/reject comments on their own posts via a dedicated page. Auto-approved if the commenter is the post owner.

**Target:** No approval queue. Comments post immediately and are visible to everyone. Moderation is reactive:
- Post owners can delete any comment on their own posts.
- Admin can delete any comment anywhere.
- The `/approveComments` page and the floating approve-comments button are removed.
- The `approved` field is removed from the Comment model.

### Delete permissions

**Posts:**
- Post owners and admin can delete any post, across all feed views.

**Comments:**
- Post owners can delete any comment on their own posts.
- Admin can delete any comment anywhere.

Both currently rely on a hardcoded `"admin"` username check (client-side only). Target: `role: "user" | "admin"` field on the User model, enforced server-side.

---

## Known bugs

1. **`/getPostsFromFollowed/:username`** — `Posts.getPostsByUserList` uses `populate` with a `match` filter which does not restrict the DB query; it fetches all posts and nulls out non-matching user fields, then returns them all including posts with `user: null`. Fix: use `find({ user: { $in: userList } })`.

2. **No server-side authorization** — all mutating endpoints accept a username in the body and trust it blindly. Any client can delete any post, approve any comment, or follow/unfollow anyone by passing an arbitrary username.

3. **JWT token logged to stdout** — `server.ts:120` calls `console.log(token)` after every successful login.

4. **`PRODUCTION_MODE` default is `true`** — means `npm start` after a fresh `npm install` (without building) will serve from a non-existent `dist/public`. Should default to `false`.

5. **`getFavoritesByUsername` double-populates** — two chained `.populate()` calls on the same `favorites` path; only the last one takes effect (comments are populated, user is not).

6. **Admin role is username-only and client-side** — any user named `"admin"` gets elevated UI privileges. There is no `role` field on the User model and no server-side enforcement. There are also commented-out experiments in `createPost.ts` and `validatetoken.ts` suggesting page-access restrictions for admin were explored but not implemented.

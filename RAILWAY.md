# Deployment — Railway (single service)

Stack: **Next.js client** (public `$PORT`) + **Express API/admin** (internal `:5001`),
both in **one Railway service**, with **MongoDB Atlas** (free) and a **persistent volume**
for uploaded images.

Why one service: the client's `next.config.mjs` rewrites and its server-component fetches
target `localhost:5001`, so the API must run in the same container. `start.js` (repo root)
boots both: Express on `5001` (internal) and Next on `$PORT` (public). No API code changes.

---

## 1. MongoDB Atlas (free)

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a user + password.
3. **Network Access** → allow `0.0.0.0/0` (Railway dyno IPs are dynamic; can't pin them).
4. **Connect → Drivers** → copy the `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/baljyoti?retryWrites=true&w=majority` string. Note the `/baljyoti` db name.

## 2. Create the Railway service

1. <https://railway.app> → **New Project → Deploy from GitHub repo** → pick this repo.
2. Railway auto-detects `railway.json` (Nixpacks build + `node start.js` start). No extra
   config needed for build/start.

## 3. Persistent volume (so admin image uploads survive restarts)

Service → **Variables/Settings → Volumes → New Volume**, mount path:

```
/app/server/public/uploads
```

The server child runs with cwd `/app/server`, and admin uploads are written to
`server/public/uploads` — so they land on the volume and persist across deploys/restarts.
Without this, uploaded product images vanish on every restart (ephemeral filesystem).

## 4. Environment variables

Service → **Variables**. Set these (see `server/.env.production.example` for the full list):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | 64+ random chars — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SESSION_SECRET` | another 64+ random chars |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key id (**set before first deploy** — baked into the build) |
| Fast2SMS group | `FAST2SMS_API_KEY`, `FAST2SMS_SENDER_ID`, `FAST2SMS_ENTITY_ID`, `FAST2SMS_DLT_TEMPLATE_ID_EN/HI`, or `DEV_MOCK_OTP=true` to start without SMS |
| Razorpay group | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (placeholders ⇒ sim mode) |
| Email | `EMAIL_USER`, `EMAIL_PASS` (Gmail app password) |

**Do NOT set:**
- `PORT` — Railway injects it (the public port Next binds to).
- `API_PORT` — defaults to `5001` (the internal Express port).
- `NEXT_PUBLIC_API_URL` — leave **blank**. Client components use relative `/api` (via
  rewrites); server components fall back to `localhost:5001`. Both work in-container.

> `NEXT_PUBLIC_*` vars are baked in at **build** time, so they must exist before the first
> deploy. Change one ⇒ redeploy to rebuild.

## 5. Seed the admin account (one-off)

After the first successful deploy, run once (Railway → service → **⋮ → Run a command**, or
locally with the Atlas `MONGODB_URI` exported):

```bash
node server/scripts/seedAdmin.js
```

Then log in at `/admin` and **change the seeded password**.

## 6. Custom domain

Service → **Settings → Networking → Custom Domain** → enter your domain. Railway shows a
**CNAME target** — add it at your DNS provider:

- Subdomain (e.g. `www` or `shop`): a `CNAME` record → the Railway target.
- Apex/root domain (e.g. `example.com`): use your provider's `ALIAS`/`ANAME`/CNAME-
  flattening feature pointing at the Railway target.

HTTPS certificates are issued automatically once DNS resolves.

## 7. Go-live checklist

- [ ] `NODE_ENV=production`, `DEV_MOCK_OTP=false` (once Fast2SMS/DLT is approved)
- [ ] Volume mounted at `/app/server/public/uploads`
- [ ] Razorpay **live** keys set (server `RAZORPAY_KEY_*` + `NEXT_PUBLIC_RAZORPAY_KEY_ID`); test a ₹1 order
- [ ] Razorpay webhook (optional) → `https://yourdomain.com/api/orders/razorpay/webhook`, set `RAZORPAY_WEBHOOK_SECRET`
- [ ] Seeded admin password changed
- [ ] Custom domain resolves over HTTPS
- [ ] Atlas Network Access allows `0.0.0.0/0`

## Updating a deployed app

Push to the connected GitHub branch — Railway rebuilds and redeploys automatically.

## Notes

- Session cookie is `secure: false` (`server/index.js`). It works over Railway HTTPS; for
  stricter prod hygiene you may later switch it to `secure: true` behind the proxy.
- The old `DEPLOYMENT.md` (Hostinger VPS + PM2 + Nginx) and `ecosystem.config.cjs` still
  describe an alternative host; this Railway path supersedes them for cloud deploy.

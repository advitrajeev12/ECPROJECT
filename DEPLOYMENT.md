# Deployment — Hostinger

Stack: **Next.js client** (port 3000) + **Express API/admin** (port 5001) +
**MongoDB**. Recommended target: a **Hostinger VPS** (KVM plan) with Nginx +
PM2. Shared/"Node.js" hosting can't comfortably run two Node processes + Mongo —
use a VPS.

Database: use **MongoDB Atlas** (free tier is fine) rather than installing Mongo
on the VPS — set its connection string in `server/.env`.

---

## 1. One-time server setup (SSH into the VPS)

```bash
# Node 20+ and pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm i -g pnpm pm2

# App code
cd /var/www
git clone <your-repo-url> ecproject
cd ecproject
```

## 2. Environment files

```bash
# Server
cp server/.env.production.example server/.env
nano server/.env          # fill Atlas URI, secrets, Fast2SMS/DLT, Razorpay live

# Client
cp client/.env.production.example client/.env.local
nano client/.env.local    # Razorpay live public key id
```

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. Install + build

```bash
cd server && pnpm install --prod && cd ..
cd client && pnpm install && pnpm build && cd ..

# Seed the admin account (creates admin@example.com / admin123 — change it!)
node server/scripts/seedAdmin.js
```

## 4. Run with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup            # run the command it prints, to survive reboots
pm2 logs               # verify both apps are up
```

## 5. Nginx reverse proxy + HTTPS

Point your domain's DNS A-record to the VPS IP, then:

```nginx
# /etc/nginx/sites-available/ecproject
server {
    server_name yourdomain.com www.yourdomain.com;

    # Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Express API + EJS admin panel (server also serves /uploads, /css)
    location ~ ^/(api|admin|uploads|css)(/|$) {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 12M;   # product image uploads
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ecproject /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Free HTTPS
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

> Note: The Next.js `rewrites()` in `client/next.config.mjs` also proxy
> `/api`, `/admin`, `/uploads`, `/css` to `127.0.0.1:5001`. With the Nginx rules
> above, either path works; Nginx handling them is slightly faster. Keep both.

## 6. Go-live checklist

- [ ] `server/.env`: `NODE_ENV=production`, `DEV_MOCK_OTP=false`
- [ ] Fast2SMS + DLT fully approved and filled (see `server/docs/OTP_FAST2SMS_DLT.md`)
- [ ] Razorpay **live** keys in `server/.env` + `client/.env.local`; test a ₹1 order
- [ ] Razorpay webhook (optional) → `https://yourdomain.com/api/orders/razorpay/webhook`, set `RAZORPAY_WEBHOOK_SECRET`
- [ ] Changed the seeded admin password
- [ ] `CLIENT_URL` / `BACKEND_URL` = your https domain
- [ ] Atlas IP allowlist includes the VPS IP

## Updating a deployed app

```bash
cd /var/www/ecproject
git pull
cd server && pnpm install --prod && cd ..
cd client && pnpm install && pnpm build && cd ..
pm2 restart ecosystem.config.cjs
```

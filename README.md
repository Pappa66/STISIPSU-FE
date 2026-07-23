# STISIPSU Frontend

Next.js frontend for STISIP Syamsul Ulum Sukabumi.

Dual-mode deployment: **VPS** (PM2 + Nginx) atau **Vercel** — tanpa perubahan kode. \
Awalnya berjalan di VPS (`145.79.8.29:3000`), lalu dimigrasi ke Vercel.

> Panduan deploy lengkap (Vercel + VPS) ada di `DEPLOY.md` di root proyek.

## Setup

```bash
npm install
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL
npm run dev
```

## Environment Variables

| Variable | Wajib | Kegunaan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Ya | Backend base URL, contoh: `https://api.stisipsu.ac.id/` |

## Deploy

Panduan deploy lengkap (Vercel + VPS) ada di `DEPLOY.md` di root proyek.

### Vercel (Production)
Push ke `main`, Vercel auto-deploy. Pastikan `NEXT_PUBLIC_API_URL` terisi di dashboard Vercel.

### VPS (Alternatif)
```bash
git clone https://github.com/Pappa66/STISIPSU-FE.git /var/www/fe
cd /var/www/fe && npm install
nano .env.local   # isi NEXT_PUBLIC_API_URL
npm run build
pm2 start node_modules/.bin/next --name stisip-fe -- start -p 3000 && pm2 save && pm2 startup
```

### Update
```bash
git pull origin main && npm install && npm run build && pm2 restart stisip-fe
```

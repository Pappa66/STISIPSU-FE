# STISIPSU Frontend

Next.js frontend for STISIP Syamsul Ulum Sukabumi.

**Deploy utama: VPS** (PM2 + Nginx). \
**Alternatif: Vercel** (serverless). \
Kode ini dual-mode — tanpa perubahan kode.

> Panduan deploy lengkap ada di `DEPLOY.md` (root proyek).

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

Panduan deploy lengkap (VPS + Vercel) ada di `DEPLOY.md` (root proyek).

### VPS (Produksi — Utama)
```bash
git clone https://github.com/Pappa66/STISIPSU-FE.git /var/www/fe
cd /var/www/fe && npm install
nano .env.local   # isi NEXT_PUBLIC_API_URL=https://api.stisipsu.ac.id/
npm run build
pm2 start node_modules/.bin/next --name stisip-fe -- start -p 3000 && pm2 save && pm2 startup
```
Lihat `DEPLOY.md` untuk setup Nginx, SSL lengkap.

### Vercel (Alternatif — Preview)
Push ke `main`, Vercel auto-deploy. Pastikan `NEXT_PUBLIC_API_URL` terisi di dashboard Vercel.

# STISIPSU Frontend

Next.js frontend for STISIP Syamsul Ulum Sukabumi.

## Setup

```bash
npm install
cp .env.example .env.local   # isi NEXT_PUBLIC_API_URL
npm run dev
```

## Environment Variables

| Variable | Wajib | Kegunaan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Ya | Backend base URL, contoh: `https://stisipsu-be.vercel.app/` |

## Deploy ke VPS (Ubuntu/Debian)

### 1. Build

```bash
git clone https://github.com/Pappa66/STISIPSU-FE.git /var/www/fe
cd /var/www/fe
npm install
nano .env.local   # isi NEXT_PUBLIC_API_URL
npm run build
```

### 2. PM2 untuk next start

```bash
npm install -g pm2
pm2 start node_modules/.bin/next --name stisip-fe -- start -p 3000
pm2 save
pm2 startup
```

### 3. Nginx

```nginx
server {
    listen 80;
    server_name stisipsu.ac.id www.stisipsu.ac.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        alias /var/www/fe/.next/static;
        expires 365d;
        access_log off;
    }

    location /images {
        alias /var/www/fe/public/images;
        expires 30d;
    }
}
```

### 4. SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d stisipsu.ac.id -d www.stisipsu.ac.id
```

### 5. Update

```bash
git pull origin main
npm install
npm run build
pm2 restart stisip-fe
```
## Deploy ke Vercel

Push ke `main`, Vercel auto-deploy.

<div align="center">
  <img src="public/logo-square.png" alt="SSB Murid" width="160" />

# SSB Murid — Sistem Semakan Buku

**Rekod semakan buku kerja murid — PWA, ringan, mesra mobile.**

[![Live](https://img.shields.io/badge/live-ssb.altrabird.click-2563eb?style=flat-square)](https://ssb.altrabird.click)
[![PWA](https://img.shields.io/badge/PWA-installable-4f46e5?style=flat-square)]()
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Express-emerald?style=flat-square)]()

</div>

---

## 🔗 Live App

**https://ssb.altrabird.click**

---

## ✨ Ciri-ciri Utama

- 📚 **Senarai murid automatik** — sync dari Google Sheets (CSV)
- ✅ **Status semakan** — `Hantar` / `Tiada` / `Pending` setiap murid
- 📸 **Muat naik evidens** — gambar buku terus ke Supabase Storage
- 📄 **PDF report** — eksport rekod harian dengan URL evidens pendek (TinyURL)
- 🔄 **Dua paparan** — Kad (default) atau Senarai, toggle tersedia di desktop & mobile
- 📱 **PWA** — boleh dipasang di HP/PC, berfungsi offline (selepas first load)
- 🔒 **Gemini API proxy** — API key disimpan server-side, tak bocor ke client bundle
- 🌐 **SSL** — HTTPS via Let's Encrypt (auto-renew)

---

## 🛠️ Tech Stack

| Layer | Pilihan |
|-------|---------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Motion |
| Server | Express.js (proxy + static serve) |
| Storage | Supabase (evidens), Google Sheets (data murid) |
| PDF | jsPDF + jspdf-autotable |
| PWA | vite-plugin-pwa, Workbox |
| Hosting | VPS Ubuntu + Nginx + PM2 + Certbot |

---

## 🚀 Run Locally

**Prerequisites:** Node.js ≥ 20

```bash
# 1. Install dependencies
npm install

# 2. Setup .env (lihat .env.example)
cp .env.example .env
# Isi: VITE_GOOGLE_SHEET_CSV_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, GEMINI_API_KEY

# 3. Run dev server (Vite + Express proxy)
npm run dev:server    # terminal 1 (port 3001)
npm run dev           # terminal 2 (port 5173, proxies /api → 3001)
```

---

## 🔐 Environment Variables

Lihat `.env.example`. Yang penting:

| Variable | Type | Guna |
|----------|------|------|
| `VITE_GOOGLE_SHEET_CSV_URL` | client | URL CSV Google Sheets |
| `VITE_SUPABASE_URL` | client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client | Supabase anon public key |
| `GEMINI_API_KEY` | **server only** | Gemini API key (jangan letak `VITE_` prefix) |
| `PORT` | server | Default 3000 (VPS guna 3010) |

---

## 📦 Build & Deploy to VPS

```bash
# Pada VPS
cd /var/www/ssb
git pull
npm install
npm run build
pm2 restart ssb
```

**Stack VPS:**
- PM2 process name: `ssb`
- Port: `3010`
- Nginx config: `/etc/nginx/sites-enabled/ssb.altrabird.click`
- SSL: `/etc/letsencrypt/live/ssb.altrabird.click/` (auto-renew 90 hari)

---

## 📱 Install sebagai App (PWA)

### Android (Chrome)
1. Buka **https://ssb.altrabird.click**
2. Menu **⋮** → **Install app** / **Add to Home screen**

### iPhone / iPad (Safari)
1. Buka URL dalam **Safari** (bukan Chrome)
2. Tap **Share** (kotak + anak panah) → **Add to Home Screen**

### Desktop (Chrome / Edge)
- Ikon **install** akan muncul di address bar → klik **Install**

---

## 📋 Project Structure

```
.
├── public/
│   ├── logo.png              # Header logo (rectangular)
│   └── logo-square.png       # PWA + favicon (512×512)
├── src/
│   ├── App.tsx               # Main UI
│   ├── components/
│   │   ├── StudentCard.tsx   # Card view
│   │   ├── StudentListRow.tsx# List view
│   │   ├── RecordsModal.tsx  # Rekod semakan semasa
│   │   └── Summary.tsx
│   ├── services/
│   │   ├── googleSheetsService.ts
│   │   ├── supabaseService.ts
│   │   └── pdfService.ts     # PDF + URL shortener
│   └── types.ts
├── server.ts                 # Express proxy (Gemini, TinyURL, static)
├── vite.config.ts            # Vite + PWA manifest
└── index.html
```

---

## 📜 Changelog

### 2026-05 — Logo refresh
- Logo custom SSB dipasang di header, favicon, dan PWA install icon.

### 2026-04 — Initial deployment
- Deployed to `ssb.altrabird.click` with SSL.
- PWA installable (Android/iOS/Desktop).
- Mobile view toggle (Kad / Senarai).
- Mobile-friendly Rekod Semakan modal (stacked cards + X close button).
- Removed Jantina column.
- PDF report: "ADA" diganti dengan URL pendek yang boleh diklik.
- Express proxy untuk Gemini API (server-side key).

---

## 📝 License

Internal use — SKBT 2026.

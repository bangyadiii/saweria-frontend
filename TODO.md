# TODO — saweria-frontend

Legend: ✅ Done · 🔧 In Progress / Sliced (UI ada, integrasi BE belum) · ❌ Belum dibuat

---

## Auth

- ✅ Halaman Login (`/login`) — form email + password, validasi Zod, integrasi API + NextAuth credentials
- ✅ Halaman Register (`/register`) — form email, username, password, confirm password, integrasi API
- ✅ NextAuth setup — credentials provider, JWT session strategy, route handler
- ✅ Middleware proteksi route dashboard (`/dashboard`, `/overlay`)
- ❌ Tombol "Login dengan Google" di `/login`
- ❌ Tombol "Daftar dengan Google" di `/register`
- ❌ NextAuth Google provider setup (`GoogleProvider` di `auth.ts`)

---

## Landing Page (`/`)

- ✅ Struktur dasar halaman — logo, tagline, CTA Login/Register
- ✅ Konten metode pembayaran (card)
- ❌ Halaman landing lengkap sesuai PRD (contoh overlay, penjelasan fitur)

---

## Dashboard (`/dashboard`)

- ✅ Layout dashboard — `DashboardHeader`, `DashboardFooter`
- ✅ Grid menu dashboard — Overlay, Dukungan Masuk & Cashout, Dukungan Keluar, Integration
- ✅ Header profile dropdown — avatar, username dari session, link profil, tombol logout

---

## Overlay — Alert (`/overlay/alert`)

- ✅ Sidebar tab (Alert / MediaShare)
- ✅ Form aturan alert — GIF toggle, TTS variant select, minimum alert/mediashare/TTS input
- ✅ Form template alert — color picker background/highlight/text, template text input, notification duration
- ✅ `AlertPreview` — preview real-time berdasarkan template & warna
- ✅ `FilterKataForm` — textarea filter kata
- ✅ `NotificationSound` — UI upload suara / hapus / ganti suara
- 🔧 `onSubmit` form aturan alert — masih `console.log`, belum hit API (`PUT /overlay/alert`)
- 🔧 `onSubmit` form template — masih `console.log`, belum hit API (`PUT /overlay/template`)
- 🔧 `onSubmit` filter kata — masih `console.log`, belum hit API (`PUT /overlay/filter`)
- 🔧 Upload suara notifikasi — belum hit API (`PUT /overlay/sound`)
- ❌ Load initial data dari BE saat halaman dibuka (`GET /overlay/settings`)
- ❌ Reset template ke default (tombol `RotateCw` ada tapi belum ada logic)

---

## Overlay — MediaShare (`/overlay/mediashare`)

- ✅ Route & sidebar tab tersedia
- ❌ UI pengaturan mediashare (minimum nominal, tampilan player, antrian)
- ❌ Integrasi API (`GET/PUT /overlay/mediashare` atau dari `/overlay/settings`)

---

## Halaman OBS Browser Source

- ❌ `/obs/alert?key={streamKey}` — WebSocket listener, animasi alert, TTS, antrian alert, background transparan
- ❌ `/obs/mediashare?key={streamKey}` — WebSocket listener, embed YouTube/TikTok, antrian media
- ✅ Dockerfile untuk frontend

---

## Donasi Publik (`/[username]`)

- ✅ Route tersedia, menampilkan username dari params
- ❌ Profil singkat streamer (nama, foto) di bagian atas halaman
- ❌ Form donasi:
    - ❌ Input nominal (min Rp 1.000)
    - ❌ Input nama donor
    - ❌ Input pesan (opsional, max 300 karakter)
    - ❌ Input link media YouTube/TikTok (opsional, validasi domain)
    - ❌ Checkbox syarat & ketentuan
    - ❌ Pilih metode pembayaran (dari Midtrans)
    - ❌ Tombol kirim → hit `POST /donate/:username` → redirect ke Midtrans Snap/hosted page
- ❌ Halaman sukses/pending setelah pembayaran

---

## Profil Streamer (`/profile`)

- ✅ Route tersedia
- ❌ Form edit profil — foto, nama tampilan, bio
- ❌ Load data profil dari BE (`GET /users/me`)
- ❌ Simpan perubahan profil (`PUT /users/me`)
- ❌ Upload foto profil

---

## Histori Donasi & Cashout (`/donations`)

- ❌ Halaman belum dibuat
- ❌ Tabel histori donasi masuk (nama donor, nominal, pesan, status, tanggal)
- ❌ Tampil saldo tersedia
- ❌ Form/flow cashout (nominal, rekening/e-wallet)
- ❌ Histori cashout
- ❌ Integrasi API (`GET /donations`, `GET /wallet/balance`, `POST /wallet/cashout`, `GET /wallet/cashout/history`)

---

## Integration (`/integration`)

- ❌ Halaman belum dibuat
- ❌ Tampilkan QR Code yang mengarah ke `/{username}`
- ❌ Tampilkan Stream Key (masked) + tombol reset (`POST /overlay/stream-key/reset`)
- ❌ Tampilkan URL Overlay Alert untuk OBS
- ❌ Tampilkan URL Overlay MediaShare untuk OBS
- ❌ Tombol copy URL ke clipboard

---

## Konfigurasi & Infrastruktur

- ✅ `lib/axios.ts` — Axios instance
- ✅ `lib/api-endpoints.ts` — endpoint LOGIN, REGISTER
- ✅ `lib/env.ts` — `Env.SERVER_ENDPOINT`
- ✅ `providers/NextAuthProvider.tsx`
- ✅ `providers/ProgressBarProvider.tsx`
- ❌ Tambah endpoint baru di `api-endpoints.ts` (donate, overlay, wallet, user, dll.)
- ❌ Axios interceptor — attach JWT token dari session ke setiap request (Authorization header)
- ❌ Setup `NEXT_PUBLIC_WS_URL` di env untuk koneksi WebSocket OBS
- ✅ `Dockerfile` + `docker-compose.yml` di root
- ❌ Google OAuth env (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) di `.env.local`

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

- ✅ Sidebar tab (Alert / MediaShare / Milestone / Subathon)
- ✅ Form aturan alert — GIF toggle, TTS variant select, minimum alert/mediashare/TTS input
- ✅ `onSubmit` form aturan alert — hit API (`PUT /overlay/alert`)
- ✅ Form template alert — color picker background/highlight/text, template text input, notification duration
- ✅ `onSubmit` form template — hit API (`PUT /overlay/template`)
- ✅ `AlertPreview` — preview real-time berdasarkan template & warna
- ✅ `FilterKataForm` — textarea filter kata, hit API (`PUT /overlay/filter`)
- ✅ `NotificationSound` — upload/hapus/ganti suara, hit API (`PUT /overlay/sound`)
- ✅ Load initial data dari BE saat halaman dibuka (`GET /overlay/settings`)
- ✅ Tombol Tes Alert — `POST /overlay/test-alert` broadcast WS ke widget
- ❌ Reset template ke default (tombol `RotateCw` ada tapi belum ada logic)

---

## Overlay — MediaShare (`/overlay/mediashare`)

- ✅ Route & sidebar tab tersedia
- ✅ UI pengaturan mediashare — minimum nominal, font, warna, border toggle
- ✅ Integrasi API (`GET/PUT /overlay/mediashare-template`)
- ✅ Tombol Tes MediaShare — `POST /overlay/test-mediashare` broadcast WS ke widget

---

## Overlay — Milestone (`/overlay/milestone`)

- ✅ Route & sidebar tab tersedia
- ✅ Halaman pengaturan milestone — target amount, template, warna, font, border toggle
- ✅ Preview real-time sesuai pengaturan
- ✅ Integrasi API (`GET/PUT /overlay/milestone`)
- ✅ URL widget untuk OBS

---

## Overlay — Subathon (`/overlay/subathon`)

- ✅ Route & sidebar tab tersedia
- ✅ Halaman pengaturan subathon — initial time, aturan tambah waktu per nominal donasi
- ✅ Preview real-time countdown sesuai pengaturan
- ✅ `ControlPanel` — tombol Start/Pause, input tambah waktu (jam/menit/detik), tombol Tes Alert
- ✅ Integrasi API (`GET/PUT /overlay/subathon`, `POST /overlay/subathon/control`)
- ✅ URL widget untuk OBS

---

## Halaman OBS Browser Source (`/widget/*`)

- ✅ `/widget/alert?key={streamKey}` — WebSocket listener, animasi alert, TTS, antrian alert, background transparan
- ✅ `/widget/mediashare?key={streamKey}` — WebSocket listener, embed YouTube/TikTok, antrian media
- ✅ `/widget/milestone?key={streamKey}` — WebSocket listener, progress bar, animasi pencapaian
- ✅ `/widget/subathon?key={streamKey}` — WebSocket listener, countdown timer, popup notifikasi tambah waktu, sinkronisasi state dari BE
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

- ✅ `lib/axios.ts` — Axios instance dengan JWT interceptor (attach token dari session ke setiap request)
- ✅ `lib/api-endpoints.ts` — endpoint lengkap: auth, overlay (alert, mediashare, milestone, subathon, control, test), widget, WS
- ✅ `lib/env.ts` — `Env.SERVER_ENDPOINT` + `Env.WS_ENDPOINT`
- ✅ `providers/NextAuthProvider.tsx`
- ✅ `providers/ProgressBarProvider.tsx`
- ✅ `Dockerfile` + `docker-compose.yml` di root
- ❌ Google OAuth env (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) di `.env.local`

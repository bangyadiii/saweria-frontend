# Copilot Instructions — saweria-frontend (Next.js Frontend)

## Project Context

Frontend untuk platform donasi streamer (Saweria Clone). Streamer mengelola overlay, alert, dan profil mereka. Donor mengakses halaman publik untuk mengirim donasi tanpa perlu login. Overlay OBS ditampilkan sebagai browser source yang terhubung ke backend via WebSocket.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + `tailwind-merge` + `tailwindcss-animate`
- **UI Components:** shadcn/ui (Radix UI primitives) — lihat `components/ui/`
- **Forms:** React Hook Form + Zod (resolver `@hookform/resolvers/zod`)
- **HTTP Client:** Axios (`lib/axios.ts`) — instance `$axios`
- **Auth:** NextAuth.js v4 (`next-auth`) — session strategy JWT
- **Color Picker:** `@uiw/react-color`
- **Icons:** `lucide-react`
- **Progress Bar:** `next-nprogress-bar`
- **Package Manager:** Bun

## Struktur Folder

```
app/
├── (auth)/             ← halaman login & register (public)
├── (dashboard)/        ← halaman dashboard streamer (protected)
│   ├── dashboard/      ← menu utama
│   ├── overlay/
│   │   ├── alert/      ← aturan alert, template, filter kata, suara
│   │   └── mediashare/ ← pengaturan mediashare
│   ├── donations/      ← histori donasi masuk + cashout
│   ├── integration/    ← QR code, stream key, URL overlay
│   └── profile/        ← edit profil streamer
├── (donation)/
│   └── [username]/     ← form donasi publik (no auth required)
├── (landing_page)/     ← halaman utama
├── obs/
│   ├── alert/          ← browser source OBS untuk alert (WebSocket)
│   └── mediashare/     ← browser source OBS untuk mediashare (WebSocket)
└── api/
    └── auth/[...nextauth]/ ← NextAuth route handler

components/
├── ui/                 ← shadcn/ui components (jangan edit langsung)
├── overlay/alert/      ← AlertPreview, TemplateForm, FilterKataForm, NotificationSound
├── dashboard/          ← DashboardHeader, DashboardFooter
└── AuthGuard.tsx       ← guard untuk route yang memerlukan login

lib/
├── axios.ts            ← Axios instance ($axios)
├── api-endpoints.ts    ← semua URL endpoint backend
└── env.ts              ← akses env variable (Env.SERVER_ENDPOINT)

types/
├── user.ts             ← UserType, LoginResponse
└── next-auth.d.ts      ← augmentasi tipe NextAuth session

providers/
├── NextAuthProvider.tsx
└── ProgressBarProvider.tsx
```

## Konvensi Kode

### Komponen

- Semua komponen menggunakan **function component** (tidak pernah class component)
- Nama file dan komponen menggunakan **PascalCase**: `AlertPreview.tsx`
- Halaman (`page.tsx`) menggunakan nama fungsi sesuai konteks: `function Alert()`, `function Dashboard()`
- `"use client"` hanya ditambahkan jika komponen memerlukan state, effect, atau event handler
- Server Component (tanpa `"use client"`) diutamakan untuk halaman yang hanya fetch data

### Form

Selalu gunakan pola React Hook Form + Zod:

```tsx
const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

function MyForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // panggil API di sini
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
```

### HTTP Request

Gunakan instance `$axios` dari `lib/axios.ts`. Endpoint selalu diambil dari `lib/api-endpoints.ts`:

```ts
// lib/api-endpoints.ts
export const DONATE_ENDPOINT = (username: string) =>
    SERVER_ENDPOINT + `/donate/${username}`;
```

```tsx
// di komponen
import $axios from "@/lib/axios";
import { DONATE_ENDPOINT } from "@/lib/api-endpoints";

const res = await $axios.post(DONATE_ENDPOINT(username), payload);
```

- Jangan pernah hardcode URL backend di komponen
- Tangani error Axios dengan `isAxiosError(error)` dari `axios`

### Auth

- Middleware di `middleware.ts` melindungi route dashboard: matcher `["/dashboard", "/overlay"]`
- `useSession()` dari `next-auth/react` untuk cek status auth di client component
- `getServerSession(config)` untuk server component atau route handler
- Token JWT dari backend disimpan di NextAuth session (`session.user.token`)
- Augmentasi tipe session ada di `types/next-auth.d.ts`

### WebSocket (Halaman OBS)

Halaman di `app/obs/` adalah browser source untuk OBS — tidak perlu auth, hanya butuh `streamKey` dari query param:

```tsx
// app/obs/alert/page.tsx (client component)
"use client";
useEffect(() => {
    const ws = new WebSocket(`${WS_ENDPOINT}?key=${streamKey}`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "donation_alert") {
            // tampilkan alert
        }
    };
    return () => ws.close();
}, [streamKey]);
```

### Styling

- Gunakan Tailwind CSS utility classes
- Gunakan `cn()` dari `lib/utils.ts` untuk conditional class merging
- Warna dinamis (dari user input) gunakan `style` prop, bukan Tailwind arbitrary values
- Komponen dari `components/ui/` tidak dimodifikasi langsung — buat wrapper jika perlu kustomisasi

### Tipe

- Jangan gunakan `any` — gunakan `unknown` jika tipe tidak diketahui, lalu narrow
- Semua tipe API response didefinisikan di `types/`
- Prop interface komponen ditulis langsung di file komponen (tidak perlu file terpisah kecuali digunakan lintas file)

## Halaman & Fitur

### `/[username]` — Form Donasi Publik

Field form:

| Field                  | Validasi                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| Nominal (Rp)           | Wajib, min Rp 1.000                                               |
| Nama                   | Wajib, max 50 karakter                                            |
| Pesan                  | Opsional, max 300 karakter                                        |
| Link Media (YT/TikTok) | Opsional; validasi domain `youtube.com`, `youtu.be`, `tiktok.com` |
| Syarat & Ketentuan     | Wajib dicentang                                                   |
| Metode Pembayaran      | Wajib dipilih                                                     |

Setelah submit → redirect ke Midtrans Snap page menggunakan `snap_token` yang dikembalikan backend.

### `/overlay/alert` — Pengaturan Alert

Setting yang disimpan ke backend:

- `gif_setting` (boolean) — Switch
- `tts_variant` (null | "indonesia" | "inggris") — Select
- `minimum_alert`, `minimum_mediashare`, `minimum_tts` (number, Rp) — Input
- Template: `background_color`, `highlight_color`, `text_color` — ColorPicker
- `template_text` — mendukung variabel `[nama]` dan `[nominal]`
- `notification_duration` (detik) — Input
- `filter_kata` — Textarea, pisah dengan spasi
- Suara notifikasi — upload file

`AlertPreview` menampilkan preview real-time dari perubahan template.

### `/obs/alert?key={streamKey}` — OBS Browser Source

- Tidak ada UI dashboard (hanya canvas animasi)
- Connect WebSocket ke `WS_ENDPOINT?key={streamKey}`
- Event `donation_alert`: tampilkan animasi alert, jalankan TTS jika aktif
- Alert antre jika ada beberapa donasi bersamaan
- Background transparan (untuk OBS chroma key)

## Environment Variables

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Keamanan

- Jangan simpan token atau secret di `localStorage` — gunakan NextAuth session (HTTPOnly cookie)
- Validasi URL media di frontend DAN backend (jangan hanya frontend)
- Jangan render HTML dari input user langsung (`dangerouslySetInnerHTML`) — gunakan text content
- Validasi form selalu menggunakan Zod schema sebelum dikirim ke API

## Do & Don't

**DO:**

- Gunakan shadcn/ui components dari `components/ui/` untuk semua UI dasar
- Definisikan semua endpoint di `lib/api-endpoints.ts`
- Gunakan `cn()` untuk conditional className
- Tambahkan `"use client"` hanya jika benar-benar diperlukan

**DON'T:**

- Jangan hardcode URL API di komponen
- Jangan gunakan `any` sebagai tipe
- Jangan install library UI baru tanpa diskusi (sudah ada shadcn/ui + Radix)
- Jangan edit file di `components/ui/` secara langsung kecuali untuk shadcn customization yang disengaja
- Jangan gunakan `useEffect` untuk fetching data di Server Component

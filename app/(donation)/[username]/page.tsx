"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import $axios from "@/lib/axios";
import {
  DONATE_ENDPOINT,
  PUBLIC_PROFILE_ENDPOINT,
  PUBLIC_MEDIASHARE_ENDPOINT,
  PUBLIC_MABAR_ENDPOINT,
} from "@/lib/api-endpoints";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// --- Types -------------------------------------------------------------------

type ChargeResponse = {
  order_id: string;
  payment_type: string;
  qr_code_url?: string;
  deep_link_url?: string;
};

type PublicProfile = {
  username: string;
  display_name?: string;
  profile_image?: string;
};

type MediashareSettings = {
  ms_enabled: boolean;
  minimum_mediashare: number;
  ms_yt_shorts: boolean;
  ms_tiktok: boolean;
  ms_ig_reels: boolean;
  ms_voice_note: boolean;
  ms_max_video_duration: number;
  ms_max_audio_duration: number;
};

type MediaType = "youtube" | "tiktok" | "ig_reels" | "voice_note" | null;

// --- Zod schema --------------------------------------------------------------

const formSchema = z
  .object({
    donor_name: z.string().min(1, "Nama wajib diisi"),
    amount: z.coerce.number().min(1000, "Minimal Rp 1.000"),
    message: z.string().max(300).optional(),
    media_type: z
      .enum(["youtube", "tiktok", "ig_reels", "voice_note"])
      .optional(),
    media_url: z.string().optional(),
    media_start_time: z.coerce.number().min(0).optional(),
    payment_type: z.enum(["qris", "gopay"]),
    age_verified: z.boolean().refine((v) => v, "Wajib dicentang"),
    terms_agreed: z.boolean().refine((v) => v, "Wajib dicentang"),
  })
  .refine(
    (d) => {
      if (d.media_type === "youtube" && d.media_url)
        return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(d.media_url);
      if (d.media_type === "tiktok" && d.media_url)
        return /^https?:\/\/(www\.)?tiktok\.com/.test(d.media_url);
      if (d.media_type === "ig_reels" && d.media_url)
        return /^https?:\/\/(www\.)?instagram\.com/.test(d.media_url);
      return true;
    },
    { message: "URL media tidak valid", path: ["media_url"] },
  );

// --- Helpers -----------------------------------------------------------------

function fmt(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

const QUICK_AMOUNTS = [
  { label: "5k", value: 5000, cls: "bg-teal-400 text-white" },
  { label: "10k", value: 10000, cls: "bg-blue-700 text-white" },
  { label: "25k", value: 25000, cls: "bg-primary text-primary-foreground" },
  { label: "100k", value: 100000, cls: "bg-purple-500 text-white" },
];

type MediaConfig = {
  key: MediaType;
  label: string;
  color: string;
  activeColor: string;
};

const MEDIA_CONFIGS: MediaConfig[] = [
  {
    key: "youtube",
    label: "YouTube",
    color: "bg-red-700 text-white",
    activeColor: "ring-2 ring-offset-1 ring-black",
  },
  {
    key: "tiktok",
    label: "TikTok",
    color: "bg-gray-900 text-white",
    activeColor: "ring-2 ring-offset-1 ring-black",
  },
  {
    key: "ig_reels",
    label: "Reels",
    color: "bg-pink-500 text-white",
    activeColor: "ring-2 ring-offset-1 ring-black",
  },
  {
    key: "voice_note",
    label: "Voice Note",
    color: "bg-purple-600 text-white",
    activeColor: "ring-2 ring-offset-1 ring-black",
  },
];

// --- Voice Note Recorder -----------------------------------------------------

function VoiceNoteRecorder({
  onRecorded,
}: {
  onRecorded: (blob: Blob) => void;
}) {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [recorded, setRecorded] = React.useState(false);
  const mrRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      onRecorded(new Blob(chunksRef.current, { type: "audio/webm" }));
      setRecorded(true);
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    mrRef.current = mr;
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = () => {
    mrRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (recorded)
    return (
      <div className="flex items-center gap-2 border-[1px] border-black shadow-normal px-3 py-2 bg-green-50 text-sm text-green-700 font-mono">
        Voice note terekam
        <button
          onClick={() => {
            setRecorded(false);
            setSeconds(0);
          }}
          className="ml-auto text-xs underline"
        >
          Ulang
        </button>
      </div>
    );

  if (recording)
    return (
      <div className="flex items-center gap-3 border-[1px] border-black px-3 py-2 bg-red-50 text-sm font-mono">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
        <span className="text-red-600">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:
          {String(seconds % 60).padStart(2, "0")}
        </span>
        <button
          onClick={stop}
          className="ml-auto border-[1px] border-black shadow-normal active:shadow-pressed bg-red-500 text-white text-xs px-3 py-1 transition-all"
        >
          Stop
        </button>
      </div>
    );

  return (
    <button
      type="button"
      onClick={start}
      className="w-full border-[1px] border-dashed border-gray-400 py-2 text-sm text-gray-500 hover:bg-gray-50 font-mono"
    >
      Klik untuk merekam
    </button>
  );
}

// --- Main Page ----------------------------------------------------------------

export default function DonationPage({
  params,
}: Readonly<{ params: Promise<{ username: string }> }>) {
  const { username } = use(params);
  const { toast } = useToast();
  const router = useRouter();

  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [mediashare, setMediashare] = React.useState<MediashareSettings | null>(
    null,
  );
  const [mabarInfo, setMabarInfo] = React.useState<{
    mabar_enabled: boolean;
    mabar_keyword: string;
    mabar_minimum_amount: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState<MediaType>(null);
  const [voiceBlob, setVoiceBlob] = React.useState<Blob | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donor_name: "",
      amount: 100000,
      message: "",
      media_type: undefined,
      media_url: "",
      media_start_time: 0,
      payment_type: undefined,
      age_verified: false,
      terms_agreed: false,
    },
  });

  const amount = form.watch("amount");
  const paymentType = form.watch("payment_type");
  const ageVerified = form.watch("age_verified");
  const termsAgreed = form.watch("terms_agreed");

  React.useEffect(() => {
    $axios
      .get<{ data: PublicProfile }>(PUBLIC_PROFILE_ENDPOINT(username))
      .then((res) => setProfile(res.data.data))
      .catch(() => setProfile({ username }));
    $axios
      .get<{ data: MediashareSettings }>(PUBLIC_MEDIASHARE_ENDPOINT(username))
      .then((res) => setMediashare(res.data.data))
      .catch(() => setMediashare(null));
    $axios
      .get<{
        data: {
          mabar_enabled: boolean;
          mabar_keyword: string;
          mabar_minimum_amount: number;
        };
      }>(PUBLIC_MABAR_ENDPOINT(username))
      .then((res) => setMabarInfo(res.data?.data ?? null))
      .catch(() => {});
  }, [username]);

  const msEnabled = !!(
    mediashare?.ms_enabled &&
    amount >= (mediashare?.minimum_mediashare ?? Infinity)
  );

  const availableMedia = React.useMemo<MediaConfig[]>(() => {
    if (!mediashare?.ms_enabled) return [];
    return MEDIA_CONFIGS.filter((m) => {
      if (m.key === "youtube") return mediashare.ms_yt_shorts;
      if (m.key === "tiktok") return mediashare.ms_tiktok;
      if (m.key === "ig_reels") return mediashare.ms_ig_reels;
      if (m.key === "voice_note") return mediashare.ms_voice_note;
      return false;
    });
  }, [mediashare]);

  React.useEffect(() => {
    if (!msEnabled && selectedMedia !== null) {
      setSelectedMedia(null);
      form.setValue("media_type", undefined);
      form.setValue("media_url", "");
    }
  }, [msEnabled, selectedMedia, form]);

  const selectMedia = (key: MediaType) => {
    const next = selectedMedia === key ? null : key;
    setSelectedMedia(next);
    form.setValue("media_type", next ?? undefined);
    form.setValue("media_url", "");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      let mediaUrl = values.media_url ?? "";
      if (
        values.media_type === "youtube" &&
        mediaUrl &&
        values.media_start_time
      ) {
        mediaUrl +=
          (mediaUrl.includes("?") ? "&" : "?") + `t=${values.media_start_time}`;
      }

      const payload: Record<string, unknown> = {
        donorName: values.donor_name,
        amount: values.amount,
        message: values.message ?? "",
        paymentType: values.payment_type,
        mediaUrl: mediaUrl,
      };

      if (values.media_type === "voice_note" && voiceBlob) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append("voiceNote", voiceBlob, "voice.webm");
        const res = await $axios.post<{ data: ChargeResponse }>(
          DONATE_ENDPOINT(username),
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        const result = res.data.data;
        sessionStorage.setItem(
          `pay_${result.order_id}`,
          JSON.stringify(result),
        );
        router.push(`/${username}/pay/${result.order_id}`);
      } else {
        const res = await $axios.post<{ data: ChargeResponse }>(
          DONATE_ENDPOINT(username),
          payload,
        );
        const result = res.data.data;
        sessionStorage.setItem(
          `pay_${result.order_id}`,
          JSON.stringify(result),
        );
        router.push(`/${username}/pay/${result.order_id}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Terjadi kesalahan.";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  console.log({ profile, mediashare, mabarInfo });

  const displayName = profile?.display_name ?? profile?.username ?? username;

  return (
    <div className="min-h-screen bg-gray-100 font-mono">
      {/* Top ticker */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 overflow-hidden whitespace-nowrap">
        <span className="inline-block animate-marquee px-4">
          Ada yang baru! Sekarang kamu bisa beri dukungan lebih besar buat
          streamer favoritmu pakai metode pembayaran Virtual Account lho!
          &nbsp;&nbsp;&nbsp; Ada yang baru! Sekarang kamu bisa beri dukungan
          lebih besar buat streamer favoritmu pakai metode pembayaran Virtual
          Account lho!
        </span>
      </div>

      <div className="max-w-xl mx-auto w-full">
        {/* Header: avatar + name */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          {profile?.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_image}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-[1px] border-black"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-[1px] border-black bg-teal-400 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-gray-800 text-lg leading-tight">
            {displayName}
          </span>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-4 space-y-5 pb-32">
              {/* Nominal */}
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Nominal: <span className="text-red-500">*</span>
                </label>
                <FormField
                  name="amount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center mt-1 border-b border-gray-400 pb-1">
                          <span className="text-sm text-gray-500 mr-1 shrink-0">
                            Rp
                          </span>
                          <input
                            type="number"
                            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 font-mono"
                            placeholder="Ketik jumlah dukungan"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {QUICK_AMOUNTS.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => form.setValue("amount", q.value)}
                      className={`py-2.5 text-sm font-bold border-[1px] border-black shadow-normal active:shadow-pressed transition-all ${q.cls} ${amount === q.value ? "opacity-100" : "opacity-80"}`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dari */}
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Dari: <span className="text-red-500">*</span>
                </label>
                <FormField
                  name="donor_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="mt-1">
                          {field.value ? (
                            <div className="mb-1.5">
                              <span className="inline-block border border-dashed border-primary text-primary text-sm font-bold px-3 py-1">
                                {field.value}
                              </span>
                            </div>
                          ) : null}
                          <input
                            className="w-full border-b border-gray-400 bg-transparent py-1 text-sm outline-none placeholder-gray-400 font-mono"
                            placeholder="Nama kamu"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pesan */}
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Pesan: <span className="text-red-500">*</span>
                </label>
                <FormField
                  name="message"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="w-full mt-1 border-b border-gray-400 bg-transparent py-1 text-sm outline-none placeholder-gray-400 font-mono resize-none"
                          placeholder="Selamat pagi"
                          maxLength={300}
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mabarInfo?.mabar_enabled && (
                  <div className="mt-2 border border-dashed border-blue-400 bg-blue-50 rounded p-3 text-xs font-mono text-blue-800">
                    Ketik{" "}
                    <strong>{mabarInfo.mabar_keyword} [username_game]</strong>{" "}
                    di pesan (min.{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(mabarInfo.mabar_minimum_amount)}
                    ) untuk masuk antrian Mabar!
                  </div>
                )}
              </div>

              {/* Media */}
              {mediashare?.ms_enabled && availableMedia.length > 0 && (
                <div>
                  <label className="text-sm font-bold text-gray-800">
                    Media:
                  </label>
                  <div
                    className={`mt-2 flex flex-wrap gap-2 ${!msEnabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {availableMedia.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => selectMedia(m.key)}
                        className={`px-4 py-1.5 text-sm font-bold border-[1px] border-black shadow-normal active:shadow-pressed transition-all ${m.color} ${selectedMedia === m.key ? m.activeColor : ""}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {!msEnabled && (
                    <p className="text-xs text-gray-400 mt-1">
                      Min. Rp {fmt(mediashare.minimum_mediashare)} untuk
                      mediashare
                    </p>
                  )}
                  {selectedMedia === "youtube" && msEnabled && (
                    <div className="mt-2 space-y-2">
                      <FormField
                        name="media_url"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                className="w-full border-b border-gray-400 bg-transparent py-1 text-sm outline-none placeholder-gray-400 font-mono"
                                placeholder="https://youtube.com/watch?v=..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="media_start_time"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  className="w-20 border-b border-gray-400 bg-transparent py-1 text-sm outline-none font-mono"
                                  placeholder="0"
                                  {...field}
                                />
                                <span className="text-xs text-gray-400">
                                  detik mulai
                                </span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {(selectedMedia === "tiktok" ||
                    selectedMedia === "ig_reels") &&
                    msEnabled && (
                      <div className="mt-2">
                        <FormField
                          name="media_url"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  className="w-full border-b border-gray-400 bg-transparent py-1 text-sm outline-none placeholder-gray-400 font-mono"
                                  placeholder={
                                    selectedMedia === "tiktok"
                                      ? "https://tiktok.com/@..."
                                      : "https://instagram.com/reel/..."
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  {selectedMedia === "voice_note" && msEnabled && (
                    <div className="mt-2">
                      <VoiceNoteRecorder onRecorded={setVoiceBlob} />
                    </div>
                  )}
                </div>
              )}

              {/* Age verification */}
              <div className="space-y-3">
                <FormField
                  name="age_verified"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="age_verified"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="age_verified"
                          className="text-xs text-gray-600 leading-relaxed cursor-pointer font-mono"
                        >
                          Saya berusia 17 tahun atau lebih
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="terms_agreed"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="terms_agreed"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="terms_agreed"
                          className="text-xs text-gray-600 leading-relaxed cursor-pointer font-mono"
                        >
                          Saya memahami dan menyetujui bahwa dukungan yang saya
                          berikan secara sukarela untuk mendukung konten, tidak
                          dapat dikembalikan, bukan transaksi komersial, tidak
                          digunakan untuk aktivitas ilegal, serta telah sesuai
                          dengan{" "}
                          <span className="text-primary underline">
                            syarat dan ketentuan
                          </span>{" "}
                          &amp; kebijakan privasi saweria.co
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Moda Pembayaran */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">
                  Moda pembayaran:
                </p>
                <FormField
                  name="payment_type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {(["qris", "gopay"] as const).map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => field.onChange(method)}
                              className={`flex items-center justify-center py-3 border-[1px] border-black shadow-normal active:shadow-pressed transition-all font-bold text-sm ${
                                field.value === method
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-white text-gray-700"
                              }`}
                            >
                              {method === "qris" ? "QRIS" : "GoPay"}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bottom sticky bar */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
              <div className="w-full max-w-xl bg-white border-t-[1px] border-x-[1px] border-black px-4 py-3 flex items-center justify-between gap-4 pointer-events-auto">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-mono">
                    Jumlah Dukungan: Rp{fmt(amount || 0)}
                  </span>
                  <span className="text-sm font-bold text-gray-800 font-mono">
                    Total: Rp{fmt(paymentType ? amount : 0)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading || !ageVerified || !termsAgreed}
                  className="bg-primary text-primary-foreground text-sm font-bold px-6 py-2.5 border-[1px] border-black shadow-normal active:shadow-pressed transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                >
                  {loading ? "Memproses..." : "Kirim Dukungan"}
                </button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

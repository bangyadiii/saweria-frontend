"use client";

import ColorPicker from "@/components/color-picker";
import ControlPanel from "@/components/overlay/ControlPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  OVERLAY_MEDIASHARE_RULES_ENDPOINT,
  OVERLAY_MEDIASHARE_TEMPLATE_ENDPOINT,
  OVERLAY_SETTINGS_ENDPOINT,
  OVERLAY_STREAM_KEY_RESET_ENDPOINT,
  OVERLAY_TEST_MEDIASHARE_ENDPOINT,
} from "@/lib/api-endpoints";
import $axios from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink } from "lucide-react";
import Env from "@/lib/env";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

type OverlaySettings = {
  ms_enabled: boolean;
  ms_yt_shorts: boolean;
  ms_tiktok: boolean;
  ms_ig_reels: boolean;
  ms_voice_note: boolean;
  ms_max_video_duration: number;
  ms_price_per_second_video: number;
  ms_max_audio_duration: number;
  ms_price_per_second_audio: number;
  ms_min_audio: number;
  minimum_mediashare: number;
  ms_background_color: string | null;
  ms_highlight_color: string | null;
  ms_text_color: string | null;
  ms_template_text: string;
  ms_no_border: boolean;
  ms_font_weight: number;
  ms_font_family: string;
  ms_show_nsfw: boolean;
  stream_key: string | null;
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const rulesSchema = z.object({
  ms_enabled: z.boolean(),
  ms_yt_shorts: z.boolean(),
  ms_tiktok: z.boolean(),
  ms_ig_reels: z.boolean(),
  ms_voice_note: z.boolean(),
  ms_max_video_duration: z.coerce.number().min(0),
  ms_price_per_second_video: z.coerce.number().min(0),
  ms_max_audio_duration: z.coerce.number().min(0),
  ms_price_per_second_audio: z.coerce.number().min(0),
  ms_min_audio: z.coerce.number().min(0),
  minimum_mediashare: z.coerce.number().min(0),
});

const templateSchema = z.object({
  ms_background_color: z.string().nullable(),
  ms_highlight_color: z.string().nullable(),
  ms_text_color: z.string().nullable(),
  ms_template_text: z.string(),
  ms_no_border: z.boolean(),
  ms_font_weight: z.coerce.number(),
  ms_font_family: z.string(),
  ms_show_nsfw: z.boolean(),
});

const DEFAULT_TEMPLATE = "baru saja memberi";

// ─── Preview ──────────────────────────────────────────────────────────────────

interface PreviewProps {
  backgroundColor: string | null;
  highlightColor: string | null;
  textColor: string | null;
  templateText: string;
  noBorder: boolean;
  fontWeight: number;
  fontFamily: string;
}

function MediasharePreview({
  backgroundColor,
  highlightColor,
  textColor,
  templateText,
  noBorder,
  fontWeight,
  fontFamily,
}: PreviewProps) {
  const name = "Mumu";
  const nominal = "Rp10.000";
  const message = "Semangat ya kamu 🥰";
  const previewVideoId = "LXb3EKWsInQ"; // Saweria promo video

  const bg = backgroundColor || "#358ad9";
  const hl = highlightColor || "#fcfeff";
  const tc = textColor || "#000000";
  const ff = fontFamily || "Poppins";
  const fw = fontWeight || 500;

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-lg"
      style={{ fontFamily: ff, fontWeight: fw }}
    >
      {/* Video thumbnail */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${previewVideoId}`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* Info bar */}
      <div
        className="px-4 py-3 text-center text-base"
        style={{
          backgroundColor: bg,
          borderTop: noBorder ? "none" : `3px solid ${hl}`,
        }}
      >
        <div>
          <span style={{ color: hl }}>{name} </span>
          <span style={{ color: tc }}>{templateText || DEFAULT_TEMPLATE} </span>
          <span style={{ color: hl }}>{nominal}</span>
        </div>
        {message && (
          <div className="text-sm mt-1" style={{ color: hl }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaSharePage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<OverlaySettings | null>(null);

  // ── Rules form ────────────────────────────────────────────────────────────
  const rulesForm = useForm<z.infer<typeof rulesSchema>>({
    resolver: zodResolver(rulesSchema),
    defaultValues: {
      ms_enabled: false,
      ms_yt_shorts: false,
      ms_tiktok: false,
      ms_ig_reels: false,
      ms_voice_note: false,
      ms_max_video_duration: 300,
      ms_price_per_second_video: 100,
      ms_max_audio_duration: 60,
      ms_price_per_second_audio: 5000,
      ms_min_audio: 50000,
      minimum_mediashare: 0,
    },
  });

  // ── Template form ─────────────────────────────────────────────────────────
  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      ms_background_color: "",
      ms_highlight_color: "",
      ms_text_color: "",
      ms_template_text: DEFAULT_TEMPLATE,
      ms_no_border: false,
      ms_font_weight: 500,
      ms_font_family: "Poppins",
      ms_show_nsfw: false,
    },
  });

  // ── Preview state ─────────────────────────────────────────────────────────
  const [preview, setPreview] = React.useState<PreviewProps>({
    backgroundColor: null,
    highlightColor: null,
    textColor: null,
    templateText: DEFAULT_TEMPLATE,
    noBorder: false,
    fontWeight: 500,
    fontFamily: "Poppins",
  });

  // ── Load settings ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    $axios
      .get<{ data: OverlaySettings }>(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const s = res.data.data;
        setSettings(s);
        rulesForm.reset({
          ms_enabled: s.ms_enabled,
          ms_yt_shorts: s.ms_yt_shorts,
          ms_tiktok: s.ms_tiktok,
          ms_ig_reels: s.ms_ig_reels,
          ms_voice_note: s.ms_voice_note,
          ms_max_video_duration: s.ms_max_video_duration,
          ms_price_per_second_video: s.ms_price_per_second_video,
          ms_max_audio_duration: s.ms_max_audio_duration,
          ms_price_per_second_audio: s.ms_price_per_second_audio,
          ms_min_audio: s.ms_min_audio,
          minimum_mediashare: s.minimum_mediashare,
        });
        templateForm.reset({
          ms_background_color: s.ms_background_color ?? "",
          ms_highlight_color: s.ms_highlight_color ?? "",
          ms_text_color: s.ms_text_color ?? "",
          ms_template_text: s.ms_template_text || DEFAULT_TEMPLATE,
          ms_no_border: s.ms_no_border,
          ms_font_weight: s.ms_font_weight,
          ms_font_family: s.ms_font_family || "Poppins",
          ms_show_nsfw: s.ms_show_nsfw,
        });
        setPreview({
          backgroundColor: s.ms_background_color,
          highlightColor: s.ms_highlight_color,
          textColor: s.ms_text_color,
          templateText: s.ms_template_text || DEFAULT_TEMPLATE,
          noBorder: s.ms_no_border,
          fontWeight: s.ms_font_weight,
          fontFamily: s.ms_font_family || "Poppins",
        });
        if (s.stream_key) {
          setWidgetUrl(`${Env.APP_URL}/widget/mediashare?key=${s.stream_key}`);
        }
      });
  }, [rulesForm, templateForm]);

  // ── Submit handlers ───────────────────────────────────────────────────────
  const onRulesSubmit = async (values: z.infer<typeof rulesSchema>) => {
    try {
      await $axios.put(OVERLAY_MEDIASHARE_RULES_ENDPOINT, values);
      toast({ title: "Pengaturan mediashare berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const onTemplateSubmit = async (values: z.infer<typeof templateSchema>) => {
    try {
      await $axios.put(OVERLAY_MEDIASHARE_TEMPLATE_ENDPOINT, values);
      toast({ title: "Tampilan mediashare berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan tampilan", variant: "destructive" });
    }
  };

  // ── Widget URL ────────────────────────────────────────────────────────────
  const [widgetUrl, setWidgetUrl] = React.useState("");

  const resetStreamKey = async () => {
    try {
      const res = await $axios.post<{ data: { streamKey: string } }>(
        OVERLAY_STREAM_KEY_RESET_ENDPOINT,
      );
      const key = res.data.data.streamKey;
      setWidgetUrl(`${Env.APP_URL}/widget/mediashare?key=${key}`);
      toast({ title: "Stream key berhasil direset" });
    } catch {
      toast({ title: "Gagal reset stream key", variant: "destructive" });
    }
  };

  const copyUrl = () => {
    if (!widgetUrl) return;
    navigator.clipboard.writeText(widgetUrl);
    toast({ title: "URL disalin!" });
  };

  return (
    <div className="flex flex-col gap-y-10">
      {/* ── Card 1: Pengaturan Mediashare ─────────────────────────────────── */}
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>Pengaturan Mediashare:</h2>
        </CardHeader>
        <CardContent className="font-sans">
          <Form {...rulesForm}>
            <form onSubmit={rulesForm.handleSubmit(onRulesSubmit)}>
              {/* Aktifkan */}
              <FormField
                control={rulesForm.control}
                name="ms_enabled"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Aktifkan media share:</FormLabel>
                    <FormControl>
                      <div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tipe Mediashare */}
              <h3 className="font-semibold mb-2">Tipe Mediashare:</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                {(
                  [
                    { name: "ms_yt_shorts", label: "YT / Shorts" },
                    { name: "ms_tiktok", label: "TikTok" },
                    { name: "ms_ig_reels", label: "IG Reels" },
                    { name: "ms_voice_note", label: "Voice Note" },
                  ] as const
                ).map(({ name, label }) => (
                  <FormField
                    key={name}
                    control={rulesForm.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">{label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Minimum Mediashare */}
              <h3 className="font-semibold mb-2">Minimum Mediashare:</h3>
              <div className="flex gap-x-5 mb-6">
                <FormField
                  name="minimum_mediashare"
                  control={rulesForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>GIF / media share:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span className="pr-1">Rp</span>
                          <Input {...field} type="number" placeholder="20000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Aturan minimum video */}
              <h3 className="font-semibold mb-2">Aturan minimum video:</h3>
              <div className="flex gap-x-5 mb-6">
                <FormField
                  name="ms_max_video_duration"
                  control={rulesForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Maksimum video (detik):</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_price_per_second_video"
                  control={rulesForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Berapa rupiah per detik:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span className="pr-1">Rp</span>
                          <Input {...field} type="number" placeholder="100" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Aturan minimum Suara */}
              <h3 className="font-semibold mb-2">Aturan minimum Suara:</h3>
              <div className="flex gap-x-5 mb-6">
                <FormField
                  name="ms_max_audio_duration"
                  control={rulesForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Maksimum suara (detik):</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="60" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_price_per_second_audio"
                  control={rulesForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Berapa rupiah per detik:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span className="pr-1">Rp</span>
                          <Input {...field} type="number" placeholder="5000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_min_audio"
                  control={rulesForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Minimum donasi suara:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span className="pr-1">Rp</span>
                          <Input {...field} type="number" placeholder="50000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="mt-2">
                Simpan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── Card 2: Tampilan ─────────────────────────────────────────────── */}
      <MediasharePreview {...preview} />
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>Tampilan:</h2>
        </CardHeader>
        <CardContent className="font-sans">
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)}>
              {/* Colors */}
              <div className="flex gap-x-5 mb-4">
                <FormField
                  name="ms_background_color"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Warna Background</FormLabel>
                      <FormControl>
                        <div className="flex flex-col">
                          <Input {...field} value={field.value ?? ""} />
                          <ColorPicker
                            value={field.value}
                            setValue={(hex) => {
                              setPreview((prev) => ({
                                ...prev,
                                backgroundColor: hex,
                              }));
                              templateForm.setValue("ms_background_color", hex);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_highlight_color"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Warna Highlight</FormLabel>
                      <FormControl>
                        <div className="flex flex-col">
                          <Input {...field} value={field.value ?? ""} />
                          <ColorPicker
                            value={field.value}
                            setValue={(hex) => {
                              setPreview((prev) => ({
                                ...prev,
                                highlightColor: hex,
                              }));
                              templateForm.setValue("ms_highlight_color", hex);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_text_color"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Warna Text</FormLabel>
                      <FormControl>
                        <div className="flex flex-col">
                          <Input {...field} value={field.value ?? ""} />
                          <ColorPicker
                            value={field.value}
                            setValue={(hex) => {
                              setPreview((prev) => ({
                                ...prev,
                                textColor: hex,
                              }));
                              templateForm.setValue("ms_text_color", hex);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Template text + Font */}
              <div className="flex gap-x-5 mb-4">
                <FormField
                  name="ms_template_text"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Template Teks</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPreview((prev) => ({
                              ...prev,
                              templateText: e.target.value,
                            }));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_font_family"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Font</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setPreview((prev) => ({
                              ...prev,
                              fontFamily: val,
                            }));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Montserrat">
                              Montserrat
                            </SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_font_weight"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Font Weight</FormLabel>
                      <FormControl>
                        <Select
                          value={String(field.value)}
                          onValueChange={(val) => {
                            field.onChange(Number(val));
                            setPreview((prev) => ({
                              ...prev,
                              fontWeight: Number(val),
                            }));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="300">Light (300)</SelectItem>
                            <SelectItem value="400">Regular (400)</SelectItem>
                            <SelectItem value="500">Medium (500)</SelectItem>
                            <SelectItem value="600">SemiBold (600)</SelectItem>
                            <SelectItem value="700">Bold (700)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-x-8 mb-4">
                <FormField
                  name="ms_no_border"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(val) => {
                            field.onChange(val);
                            setPreview((prev) => ({
                              ...prev,
                              noBorder: val,
                            }));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Tanpa border</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_show_nsfw"
                  control={templateForm.control}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Tampilkan NSFW</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="mt-2">
                Simpan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── Card 3: Kontrol ──────────────────────────────────────────────── */}
      <ControlPanel
        title="Kontrol Mediashare"
        showTest
        testEndpoint={OVERLAY_TEST_MEDIASHARE_ENDPOINT}
      />

      {/* ── Card 4: URL ───────────────────────────────────────────────────── */}
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>URL Widget Mediashare:</h2>
        </CardHeader>
        <CardContent className="font-sans flex flex-col gap-y-3">
          <p className="text-sm text-muted-foreground break-all">{widgetUrl}</p>
          <div className="flex gap-x-3 flex-wrap gap-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={copyUrl}
              disabled={!widgetUrl}
            >
              <Copy className="mr-2 h-4 w-4" />
              Salin URL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => widgetUrl && window.open(widgetUrl, "_blank")}
              disabled={!widgetUrl}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Buka di tab baru
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={resetStreamKey}
            >
              Reset Stream Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

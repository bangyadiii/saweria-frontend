"use client";

import ColorPicker from "@/components/color-picker";
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
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import {
  OVERLAY_LEADERBOARD_ENDPOINT,
  OVERLAY_SETTINGS_ENDPOINT,
  OVERLAY_STREAM_KEY_RESET_ENDPOINT,
} from "@/lib/api-endpoints";
import Env from "@/lib/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

type OverlaySettings = {
  lb_title: string;
  lb_bg_color: string;
  lb_text_color: string;
  lb_font_weight: number;
  lb_no_border: boolean;
  lb_hide_amount: boolean;
  lb_font_title: string;
  lb_font_content: string;
  lb_time_range: string;
  lb_limit: number;
  stream_key: string | null;
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  lb_title: z.string(),
  lb_bg_color: z.string(),
  lb_text_color: z.string(),
  lb_font_weight: z.coerce.number(),
  lb_no_border: z.boolean(),
  lb_hide_amount: z.boolean(),
  lb_font_title: z.string(),
  lb_font_content: z.string(),
  lb_time_range: z.string(),
  lb_limit: z.coerce.number().min(1).max(100),
});

const FONT_OPTIONS = [
  { value: "default", label: "default" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
];

const FONT_WEIGHT_OPTIONS = [
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
];

const TIME_RANGE_OPTIONS = [
  { value: "all", label: "Semua Waktu" },
  { value: "yearly", label: "Tahunan" },
  { value: "monthly", label: "Bulanan" },
  { value: "weekly", label: "Mingguan" },
];

// ─── Preview Component ────────────────────────────────────────────────────────

const MOCK_ENTRIES = [
  { donor_name: "Budi Santoso", total: 500000 },
  { donor_name: "Siti Rahayu", total: 350000 },
  { donor_name: "Agus Pratama", total: 200000 },
  { donor_name: "Dewi Lestari", total: 150000 },
  { donor_name: "Eko Susanto", total: 75000 },
];

interface PreviewProps {
  bgColor: string;
  textColor: string;
  noBorder: boolean;
  hideAmount: boolean;
  fontWeight: number;
  fontTitle: string;
  fontContent: string;
  title: string;
  limit: number;
}

function LeaderboardPreview({
  bgColor,
  textColor,
  noBorder,
  hideAmount,
  fontWeight,
  fontTitle,
  fontContent,
  title,
  limit,
}: PreviewProps) {
  const entries = MOCK_ENTRIES.slice(
    0,
    Math.max(1, Math.min(limit, MOCK_ENTRIES.length)),
  );

  return (
    <div
      className={`w-full rounded-md overflow-hidden shadow-normal ${!noBorder ? "border-2 border-black" : ""}`}
      style={{
        backgroundColor: bgColor,
        boxShadow: noBorder ? undefined : "6px 6px 0px 0px rgba(0,0,0,0.99)",
      }}
    >
      {/* Title */}
      <div className="px-4 pt-4 pb-2 text-center">
        <p
          className="text-2xl font-bold tracking-wide"
          style={{
            color: textColor,
            fontFamily: fontTitle === "default" ? undefined : fontTitle,
            fontWeight,
          }}
        >
          {title || "Leaderboard"}
        </p>
      </div>

      {/* Rows */}
      <div className="flex flex-col px-4 pb-4 gap-y-2">
        {entries.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-x-3 rounded px-3 py-2"
            style={{ backgroundColor: `${textColor}18` }}
          >
            <span
              className="text-xl font-bold w-8 text-center shrink-0"
              style={{
                color: textColor,
                fontFamily: fontContent === "default" ? undefined : fontContent,
                fontWeight,
              }}
            >
              #{i + 1}
            </span>
            <span
              className="flex-1 truncate font-medium"
              style={{
                color: textColor,
                fontFamily: fontContent === "default" ? undefined : fontContent,
                fontWeight,
              }}
            >
              {e.donor_name}
            </span>
            {!hideAmount && (
              <span
                className="text-sm font-semibold shrink-0"
                style={{
                  color: textColor,
                  fontFamily:
                    fontContent === "default" ? undefined : fontContent,
                  fontWeight,
                }}
              >
                Rp{e.total.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function LeaderboardPage() {
  const { toast } = useToast();
  const [widgetUrl, setWidgetUrl] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lb_title: "Leaderboard",
      lb_bg_color: "#faae2b",
      lb_text_color: "#333333",
      lb_font_weight: 500,
      lb_no_border: false,
      lb_hide_amount: false,
      lb_font_title: "default",
      lb_font_content: "default",
      lb_time_range: "all",
      lb_limit: 10,
    },
  });

  const watched = form.watch();

  React.useEffect(() => {
    $axios
      .get<{ data: OverlaySettings }>(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const s = res.data.data;
        form.reset({
          lb_title: s.lb_title || "Leaderboard",
          lb_bg_color: s.lb_bg_color || "#faae2b",
          lb_text_color: s.lb_text_color || "#333333",
          lb_font_weight: s.lb_font_weight ?? 500,
          lb_no_border: s.lb_no_border ?? false,
          lb_hide_amount: s.lb_hide_amount ?? false,
          lb_font_title: s.lb_font_title || "default",
          lb_font_content: s.lb_font_content || "default",
          lb_time_range: s.lb_time_range || "all",
          lb_limit: s.lb_limit ?? 10,
        });
        if (s.stream_key) {
          setWidgetUrl(`${Env.APP_URL}/widget/leaderboard?key=${s.stream_key}`);
        }
      })
      .catch(() => {
        toast({ title: "Gagal memuat pengaturan", variant: "destructive" });
      });
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(OVERLAY_LEADERBOARD_ENDPOINT, values);
      toast({ title: "Tampilan Leaderboard berhasil disimpan!" });
    } catch {
      toast({ title: "Gagal menyimpan tampilan", variant: "destructive" });
    }
  };

  const resetStreamKey = async () => {
    try {
      const res = await $axios.post<{ data: { streamKey: string } }>(
        OVERLAY_STREAM_KEY_RESET_ENDPOINT,
      );
      const key = res.data.data.streamKey;
      setWidgetUrl(`${Env.APP_URL}/widget/leaderboard?key=${key}`);
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
    <div className="flex flex-col gap-y-6">
      {/* ── Preview ─────────────────────────────────────────────── */}
      <LeaderboardPreview
        bgColor={watched.lb_bg_color}
        textColor={watched.lb_text_color}
        noBorder={watched.lb_no_border}
        hideAmount={watched.lb_hide_amount}
        fontWeight={watched.lb_font_weight}
        fontTitle={watched.lb_font_title}
        fontContent={watched.lb_font_content}
        title={watched.lb_title}
        limit={watched.lb_limit}
      />

      {/* ── Form ────────────────────────────────────────────────── */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-6"
        >
          <Card className="bg-gray-50 p-1">
            <CardHeader className="font-sans text-xl font-semibold flex-row items-center gap-x-2">
              <h2>Tampilan:</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => form.reset()}
                title="Reset ke default"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4">
              {/* Checkboxes */}
              <div className="flex gap-x-8 flex-wrap gap-y-4 items-start">
                <FormField
                  name="lb_no_border"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-1">
                      <FormLabel>Tanpa Border:</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lb_hide_amount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-1">
                      <FormLabel>Tanpa Jumlah Uang:</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Colors */}
                <FormField
                  name="lb_bg_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[180px]">
                      <FormLabel>Background Color:</FormLabel>
                      <FormControl>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {field.value}
                          </p>
                          <ColorPicker
                            value={field.value}
                            setValue={(v) => field.onChange(v ?? "#faae2b")}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lb_text_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[180px]">
                      <FormLabel>Text Color:</FormLabel>
                      <FormControl>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {field.value}
                          </p>
                          <ColorPicker
                            value={field.value}
                            setValue={(v) => field.onChange(v ?? "#333333")}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Judul */}
              <FormField
                name="lb_title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul:</FormLabel>
                    <FormControl>
                      <Input placeholder="Leaderboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Font weight + fonts */}
              <div className="flex gap-x-5 flex-wrap gap-y-4">
                <FormField
                  name="lb_font_weight"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Ketebalan Teks:</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FONT_WEIGHT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lb_font_title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Font Judul:</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FONT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lb_font_content"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Font Isi:</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FONT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Time range + limit */}
              <div className="flex gap-x-5 flex-wrap gap-y-4">
                <FormField
                  name="lb_time_range"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(50%-10px)]">
                      <FormLabel>Rentang Waktu:</FormLabel>
                      <div className="flex gap-x-3 flex-wrap gap-y-2 mt-1">
                        {TIME_RANGE_OPTIONS.map((o) => (
                          <label
                            key={o.value}
                            className="flex items-center gap-x-1 cursor-pointer text-sm"
                          >
                            <input
                              type="radio"
                              name="lb_time_range"
                              value={o.value}
                              checked={field.value === o.value}
                              onChange={() => field.onChange(o.value)}
                              className="accent-black"
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lb_limit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(50%-10px)]">
                      <FormLabel>Jumlah Donatur Ditampilkan:</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-fit">
                Simpan Tampilan
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* ── URL ─────────────────────────────────────────────────── */}
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>URL:</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-3">
          <p className="text-sm text-muted-foreground">
            Klik tombol Copy dan pasokan URL di &quot;Browser Module&quot; OBS.
          </p>
          <p className="font-mono text-sm break-all">{widgetUrl || "–"}</p>
          <div className="flex gap-x-3">
            <Button
              type="button"
              onClick={copyUrl}
              disabled={!widgetUrl}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!widgetUrl}
              className="flex-1"
              onClick={() => widgetUrl && window.open(widgetUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Buka di tab baru
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={resetStreamKey}
              title="Reset stream key"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaderboardPage;

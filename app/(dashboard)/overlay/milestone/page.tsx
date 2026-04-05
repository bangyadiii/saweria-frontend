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
  OVERLAY_MILESTONE_ENDPOINT,
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
  ms_title: string;
  ms_target: number;
  ms_start_date: string | null;
  ms_bg_color: string;
  ms_text_color_ms: string;
  ms_no_border_ms: boolean;
  ms_font_weight_ms: number;
  ms_font_title: string;
  ms_font_content: string;
  stream_key: string | null;
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  ms_title: z.string(),
  ms_target: z.coerce.number().min(0),
  ms_start_date: z.string().nullable(),
  ms_bg_color: z.string(),
  ms_text_color_ms: z.string(),
  ms_no_border_ms: z.boolean(),
  ms_font_weight_ms: z.coerce.number(),
  ms_font_title: z.string(),
  ms_font_content: z.string(),
});

const FONT_OPTIONS = [
  { value: "default", label: "default" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
];

const FONT_WEIGHT_OPTIONS = [
  { value: "400", label: "Normal (400)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
];

// ─── Preview Component ────────────────────────────────────────────────────────

interface PreviewProps {
  bgColor: string;
  textColor: string;
  noBorder: boolean;
  fontWeight: number;
  fontTitle: string;
  fontContent: string;
  title: string;
  target: number;
}

function MilestonePreview({
  bgColor,
  textColor,
  noBorder,
  fontWeight,
  fontTitle,
  fontContent,
  title,
  target,
}: PreviewProps) {
  const progress = 0;
  const percent = target > 0 ? Math.min((progress / target) * 100, 100) : 0;

  return (
    <div
      className={`w-full rounded-md p-4 flex flex-col gap-y-2 shadow-normal ${!noBorder ? "border-2 border-black" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      <p
        className="text-center font-semibold text-sm break-words"
        style={{
          color: textColor,
          fontFamily: fontTitle === "default" ? undefined : fontTitle,
          fontWeight,
        }}
      >
        {title || "Judul Milestone"}
      </p>
      <div className="relative w-full h-5 rounded-full border border-black overflow-hidden bg-white">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: textColor }}
        />
      </div>
      <p
        className="text-center text-xs"
        style={{
          color: textColor,
          fontFamily: fontContent === "default" ? undefined : fontContent,
          fontWeight,
        }}
      >
        Rp0 / Rp{target.toLocaleString("id-ID")}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function MilestonePage() {
  const { toast } = useToast();
  const [widgetUrl, setWidgetUrl] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ms_title: "Pengumpulan Dana",
      ms_target: 1000000,
      ms_start_date: null,
      ms_bg_color: "#faae2b",
      ms_text_color_ms: "#333333",
      ms_no_border_ms: false,
      ms_font_weight_ms: 400,
      ms_font_title: "default",
      ms_font_content: "default",
    },
  });

  const watched = form.watch();

  React.useEffect(() => {
    $axios
      .get<{ data: OverlaySettings }>(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const s = res.data.data;
        form.reset({
          ms_title: s.ms_title || "Pengumpulan Dana",
          ms_target: s.ms_target ?? 1000000,
          ms_start_date: s.ms_start_date ?? null,
          ms_bg_color: s.ms_bg_color || "#faae2b",
          ms_text_color_ms: s.ms_text_color_ms || "#333333",
          ms_no_border_ms: s.ms_no_border_ms ?? false,
          ms_font_weight_ms: s.ms_font_weight_ms ?? 400,
          ms_font_title: s.ms_font_title || "default",
          ms_font_content: s.ms_font_content || "default",
        });
        if (s.stream_key) {
          setWidgetUrl(`${Env.APP_URL}/widget/milestone?key=${s.stream_key}`);
        }
      })
      .catch(() => {
        toast({ title: "Gagal memuat pengaturan", variant: "destructive" });
      });
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(OVERLAY_MILESTONE_ENDPOINT, {
        ms_title: values.ms_title,
        ms_target: values.ms_target,
        ms_start_date: values.ms_start_date || null,
        ms_bg_color: values.ms_bg_color,
        ms_text_color_ms: values.ms_text_color_ms,
        ms_no_border_ms: values.ms_no_border_ms,
        ms_font_weight_ms: values.ms_font_weight_ms,
        ms_font_title: values.ms_font_title,
        ms_font_content: values.ms_font_content,
      });
      toast({ title: "Tampilan Milestone berhasil disimpan!" });
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
      setWidgetUrl(`${Env.APP_URL}/widget/milestone?key=${key}`);
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
      <MilestonePreview
        bgColor={watched.ms_bg_color}
        textColor={watched.ms_text_color_ms}
        noBorder={watched.ms_no_border_ms}
        fontWeight={watched.ms_font_weight_ms}
        fontTitle={watched.ms_font_title}
        fontContent={watched.ms_font_content}
        title={watched.ms_title}
        target={watched.ms_target}
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
              {/* No border + colors */}
              <div className="flex gap-x-5 flex-wrap gap-y-4 items-start">
                <FormField
                  name="ms_no_border_ms"
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
                  name="ms_bg_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[180px]">
                      <FormLabel>Warna Background:</FormLabel>
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
                  name="ms_text_color_ms"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[180px]">
                      <FormLabel>Warna Teks:</FormLabel>
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

              {/* Font weight + title + start date */}
              <div className="flex gap-x-5 flex-wrap gap-y-4">
                <FormField
                  name="ms_font_weight_ms"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Ketebalan Teks:</FormLabel>
                      <FormControl>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                          name={field.name}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHT_OPTIONS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Judul:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pengumpulan dana untuk..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_start_date"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Sejak tanggal:</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Target + fonts */}
              <div className="flex gap-x-5 flex-wrap gap-y-4">
                <FormField
                  name="ms_target"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Target milestone:</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="1000000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_font_title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Font Judul:</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="ms_font_content"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[calc(33%-10px)]">
                      <FormLabel>Font Isi:</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-fit shadow-normal transition-all active:shadow-pressed border-[1px] border-black"
              >
                Simpan Tampilan
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* ── Widget URL Card ────────────────────────────────────── */}
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>URL:</h2>
        </CardHeader>
        <CardContent className="font-sans flex flex-col gap-y-3">
          <p className="text-sm text-muted-foreground">
            Klik tombol Copy dan pastekan URL di &quot;Browser Module&quot; OBS.
          </p>
          <p className="text-sm text-muted-foreground break-all">{widgetUrl}</p>
          <div className="flex gap-x-3 flex-wrap gap-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={copyUrl}
              disabled={!widgetUrl}
            >
              <Copy className="mr-2 h-4 w-4" /> Salin URL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => widgetUrl && window.open(widgetUrl, "_blank")}
              disabled={!widgetUrl}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Buka di tab baru
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

export default MilestonePage;

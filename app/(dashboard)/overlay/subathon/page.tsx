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
  OVERLAY_SETTINGS_ENDPOINT,
  OVERLAY_STREAM_KEY_RESET_ENDPOINT,
  OVERLAY_SUBATHON_CONTROL_ENDPOINT,
  OVERLAY_SUBATHON_ENDPOINT,
  OVERLAY_TEST_ALERT_ENDPOINT,
} from "@/lib/api-endpoints";
import Env from "@/lib/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// ─── Types ─────────────────────────────────────────────────────────────────

type TimeRule = {
  min_amount: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type OverlaySettings = {
  sub_initial_hours: number;
  sub_initial_minutes: number;
  sub_initial_seconds: number;
  sub_no_border: boolean;
  sub_bg_color: string;
  sub_auto_play: boolean;
  sub_text_color: string;
  sub_font_weight: number;
  sub_font_content: string;
  sub_time_rules: TimeRule[] | null;
  stream_key: string | null;
};

// ─── Schema ────────────────────────────────────────────────────────────────

const ruleSchema = z.object({
  min_amount: z.coerce.number().min(0),
  hours: z.coerce.number().min(0),
  minutes: z.coerce.number().min(0).max(59),
  seconds: z.coerce.number().min(0).max(59),
});

const formSchema = z.object({
  sub_initial_hours: z.coerce.number().min(0),
  sub_initial_minutes: z.coerce.number().min(0).max(59),
  sub_initial_seconds: z.coerce.number().min(0).max(59),
  sub_no_border: z.boolean(),
  sub_bg_color: z.string(),
  sub_auto_play: z.boolean(),
  sub_text_color: z.string(),
  sub_font_weight: z.coerce.number(),
  sub_font_content: z.string(),
  sub_time_rules: z.array(ruleSchema),
});

type FormValues = z.infer<typeof formSchema>;

const FONT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
];

const FONT_WEIGHT_OPTIONS = [
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
];

// ─── Preview ───────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface PreviewProps {
  bgColor: string;
  textColor: string;
  noBorder: boolean;
  fontWeight: number;
  fontContent: string;
  initialHours: number;
  initialMinutes: number;
  initialSeconds: number;
}

function SubathonPreview({
  bgColor,
  textColor,
  noBorder,
  fontWeight,
  fontContent,
  initialHours,
  initialMinutes,
  initialSeconds,
}: PreviewProps) {
  const h = pad(initialHours || 0);
  const m = pad(initialMinutes || 0);
  const s = pad(initialSeconds || 0);
  const ff = fontContent === "default" ? undefined : fontContent;

  return (
    <div
      className={`w-full rounded-md overflow-hidden shadow-normal ${!noBorder ? "border-2 border-black" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="text-center py-6 text-7xl font-bold tracking-widest"
        style={{ color: textColor, fontFamily: ff, fontWeight }}
      >
        {h}:{m}:{s}
      </div>
    </div>
  );
}

// ─── Illustration ──────────────────────────────────────────────────────────

function Illustration({ rules }: { rules: TimeRule[] }) {
  const raw = rules[0];
  const example = {
    min_amount: Number(raw?.min_amount) || 10000,
    hours: Number(raw?.hours) || 0,
    minutes: Number(raw?.minutes) || 0,
    seconds: Number(raw?.seconds) || 0,
  };
  return (
    <p className="text-sm text-muted-foreground">
      Dukungan sebesar{" "}
      <span className="text-primary font-medium">
        Rp{example.min_amount.toLocaleString("id-ID")}
      </span>{" "}
      akan menambahkan waktu sebanyak{" "}
      <span className="font-medium">
        {example.hours} jam, {example.minutes} menit, {example.seconds} detik
      </span>
      .
    </p>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

// ─── Control Panel ────────────────────────────────────────────────────────

function ControlPanel({ onMessage }: { onMessage: (msg: string, error?: boolean) => void }) {
  const [addH, setAddH] = React.useState(0);
  const [addM, setAddM] = React.useState(0);
  const [addS, setAddS] = React.useState(10);
  const [loading, setLoading] = React.useState<string | null>(null);

  const control = async (action: string, extra?: object) => {
    setLoading(action);
    try {
      await $axios.post(OVERLAY_SUBATHON_CONTROL_ENDPOINT, { action, ...extra });
      const labels: Record<string, string> = {
        start: "Timer dimulai",
        pause: "Timer dijeda",
        add_time: "Waktu ditambahkan",
      };
      onMessage(labels[action] ?? "OK");
    } catch {
      onMessage("Gagal mengirim perintah", true);
    } finally {
      setLoading(null);
    }
  };

  const test = async () => {
    setLoading("test");
    try {
      await $axios.post(OVERLAY_TEST_ALERT_ENDPOINT);
      onMessage("Tes alert dikirim");
    } catch {
      onMessage("Gagal mengirim tes", true);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="bg-gray-50 p-1">
      <CardHeader className="font-sans text-xl font-semibold">
        <h2>Control Panel:</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        {/* Start / Pause */}
        <div className="flex gap-x-3">
          <Button
            type="button"
            className="shadow-normal transition-all active:shadow-pressed border border-black"
            onClick={() => control("start")}
            disabled={loading !== null}
          >
            ▶ Start
          </Button>
          <Button
            type="button"
            variant="outline"
            className="shadow-normal transition-all active:shadow-pressed border border-black"
            onClick={() => control("pause")}
            disabled={loading !== null}
          >
            ⏸ Pause
          </Button>
        </div>

        {/* Add time */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 items-end">
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Jam</label>
            <Input
              type="number"
              min={0}
              className="w-24"
              value={addH}
              onChange={(e) => setAddH(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Menit</label>
            <Input
              type="number"
              min={0}
              max={59}
              className="w-24"
              value={addM}
              onChange={(e) => setAddM(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Detik</label>
            <Input
              type="number"
              min={0}
              max={59}
              className="w-24"
              value={addS}
              onChange={(e) => setAddS(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shadow-normal transition-all active:shadow-pressed border border-black"
            onClick={() => control("add_time", { hours: addH, minutes: addM, seconds: addS })}
            disabled={loading !== null || (addH === 0 && addM === 0 && addS === 0)}
          >
            + Tambah Waktu
          </Button>
        </div>

        {/* Tes */}
        <div>
          <Button
            type="button"
            variant="outline"
            className="shadow-normal transition-all active:shadow-pressed border border-black"
            onClick={test}
            disabled={loading !== null}
          >
            Tes Alert
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Kirim donasi palsu ke widget Alert (sama seperti tombol Tes di halaman Alert).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

function SubathonPage() {
  const { toast } = useToast();
  const [widgetUrl, setWidgetUrl] = React.useState("");

  const notify = (msg: string, error = false) =>
    toast({ title: msg, variant: error ? "destructive" : "default" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sub_initial_hours: 10,
      sub_initial_minutes: 0,
      sub_initial_seconds: 0,
      sub_no_border: false,
      sub_bg_color: "#faae2b",
      sub_auto_play: false,
      sub_text_color: "#111111",
      sub_font_weight: 500,
      sub_font_content: "default",
      sub_time_rules: [{ min_amount: 0, hours: 0, minutes: 0, seconds: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sub_time_rules",
  });

  const watched = form.watch();

  React.useEffect(() => {
    $axios
      .get<{ data: OverlaySettings }>(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const s = res.data.data;
        form.reset({
          sub_initial_hours: s.sub_initial_hours ?? 10,
          sub_initial_minutes: s.sub_initial_minutes ?? 0,
          sub_initial_seconds: s.sub_initial_seconds ?? 0,
          sub_no_border: s.sub_no_border ?? false,
          sub_bg_color: s.sub_bg_color || "#faae2b",
          sub_auto_play: s.sub_auto_play ?? false,
          sub_text_color: s.sub_text_color || "#111111",
          sub_font_weight: s.sub_font_weight ?? 500,
          sub_font_content: s.sub_font_content || "default",
          sub_time_rules:
            s.sub_time_rules && s.sub_time_rules.length > 0
              ? s.sub_time_rules
              : [{ min_amount: 0, hours: 0, minutes: 0, seconds: 0 }],
        });
        if (s.stream_key) {
          setWidgetUrl(`${Env.APP_URL}/widget/subathon?key=${s.stream_key}`);
        }
      })
      .catch(() =>
        toast({ title: "Gagal memuat pengaturan", variant: "destructive" }),
      );
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      await $axios.put(OVERLAY_SUBATHON_ENDPOINT, {
        sub_initial_hours: values.sub_initial_hours,
        sub_initial_minutes: values.sub_initial_minutes,
        sub_initial_seconds: values.sub_initial_seconds,
        sub_no_border: values.sub_no_border,
        sub_bg_color: values.sub_bg_color,
        sub_auto_play: values.sub_auto_play,
        sub_text_color: values.sub_text_color,
        sub_font_weight: values.sub_font_weight,
        sub_font_content: values.sub_font_content,
        sub_time_rules: values.sub_time_rules,
      });
      toast({ title: "Pengaturan Subathon berhasil disimpan!" });
    } catch {
      toast({ title: "Gagal menyimpan pengaturan", variant: "destructive" });
    }
  };

  const resetStreamKey = async () => {
    try {
      const res = await $axios.post<{ data: { streamKey: string } }>(
        OVERLAY_STREAM_KEY_RESET_ENDPOINT,
      );
      const key = res.data.data.streamKey;
      setWidgetUrl(`${Env.APP_URL}/widget/subathon?key=${key}`);
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
      <SubathonPreview
        bgColor={watched.sub_bg_color}
        textColor={watched.sub_text_color}
        noBorder={watched.sub_no_border}
        fontWeight={watched.sub_font_weight}
        fontContent={watched.sub_font_content}
        initialHours={watched.sub_initial_hours}
        initialMinutes={watched.sub_initial_minutes}
        initialSeconds={watched.sub_initial_seconds}
      />
      {/* ── Control Panel ─────────────────────────────────── */}
      <ControlPanel onMessage={notify} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-6"
        >
          {/* ── Aturan pertambahan waktu ─────────────────────────── */}
          <Card className="bg-gray-50 p-1">
            <CardHeader className="font-sans text-xl font-semibold">
              <h2>Aturan pertambahan waktu:</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-x-3 text-sm font-medium text-muted-foreground px-1">
                <span>Besar dukungan</span>
                <span>Jam</span>
                <span>Menit</span>
                <span>Detik</span>
                <span />
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_40px] gap-3 items-start"
                >
                  <FormField
                    name={`sub_time_rules.${index}.min_amount`}
                    control={form.control}
                    render={({ field: f }) => (
                      <FormItem className="col-span-2 md:col-span-1">
                        <FormLabel className="md:hidden text-xs text-muted-foreground">
                          Besar dukungan
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} placeholder="0" {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`sub_time_rules.${index}.hours`}
                    control={form.control}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="md:hidden text-xs text-muted-foreground">
                          Jam
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} placeholder="0" {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`sub_time_rules.${index}.minutes`}
                    control={form.control}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="md:hidden text-xs text-muted-foreground">
                          Menit
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={`sub_time_rules.${index}.seconds`}
                    control={form.control}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="md:hidden text-xs text-muted-foreground">
                          Detik
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="mt-auto"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit border-black shadow-normal active:shadow-pressed"
                onClick={() =>
                  append({ min_amount: 0, hours: 0, minutes: 0, seconds: 0 })
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Tambah aturan
              </Button>

              {/* Illustration */}
              <Illustration rules={watched.sub_time_rules} />
            </CardContent>
          </Card>

          {/* ── Tampilan ─────────────────────────────────────────── */}
          <Card className="bg-gray-50 p-1">
            <CardHeader className="font-sans text-xl font-semibold">
              <h2>Tampilan:</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4">
              {/* Durasi awal */}
              <div className="flex gap-x-5 flex-wrap gap-y-4">
                <FormField
                  name="sub_initial_hours"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[120px]">
                      <FormLabel>Durasi awal (jam):</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="sub_initial_minutes"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[120px]">
                      <FormLabel>Durasi awal (menit):</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="sub_initial_seconds"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[120px]">
                      <FormLabel>Durasi awal (detik):</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Checkboxes + Background color */}
              <div className="flex gap-x-8 flex-wrap gap-y-4 items-start">
                <FormField
                  name="sub_no_border"
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
                    </FormItem>
                  )}
                />
                <FormField
                  name="sub_bg_color"
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
                    </FormItem>
                  )}
                />
                <FormField
                  name="sub_auto_play"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-y-1">
                      <FormLabel>Auto Play:</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Text color + font */}
              <div className="flex gap-x-5 flex-wrap gap-y-4 items-start">
                <FormField
                  name="sub_text_color"
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
                            setValue={(v) => field.onChange(v ?? "#111111")}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="sub_font_weight"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[150px]">
                      <FormLabel>Ketebalan Teks:</FormLabel>
                      <FormControl>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHT_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="sub_font_content"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[150px]">
                      <FormLabel>Font Isi:</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
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

      {/* ── Panduan ──────────────────────────────────────────────── */}
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>Panduan penggunaan:</h2>
        </CardHeader>
        <CardContent className="font-sans text-sm flex flex-col gap-y-2">
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>
              Copy url di bawah dan pastekan pada OBS Browser source seperti
              penggunaan overlay saweria yang lain.
            </li>
            <li>
              Setelah tersimpan, klik kanan pada source yang baru saja
              ditambahkan dan pilih <strong>interact</strong>.
            </li>
            <li>
              Sebuah window akan muncul dan pada sisi kanan akan terlihat 2
              tombol yang berfungsi untuk:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Memulai / menghentikan hitungan mundur.</li>
                <li>Menambahkan waktu secara manual.</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* ── Widget URL ───────────────────────────────────────────── */}
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
              <Copy className="mr-2 h-4 w-4" /> Copy
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

export default SubathonPage;

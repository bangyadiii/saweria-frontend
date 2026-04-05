"use client";

import ColorPicker from "@/components/color-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  OVERLAY_QR_ENDPOINT,
  OVERLAY_SETTINGS_ENDPOINT,
  OVERLAY_STREAM_KEY_RESET_ENDPOINT,
} from "@/lib/api-endpoints";
import Env from "@/lib/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import React from "react";
import QRCode from "react-qr-code";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

type OverlaySettings = {
  qr_background_color: string;
  qr_barcode_color: string;
  qr_label_top: string;
  qr_label_bottom: string;
  qr_font_family: string;
  stream_key: string | null;
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  qr_background_color: z.string(),
  qr_barcode_color: z.string(),
  qr_label_top: z.string(),
  qr_label_bottom: z.string(),
  qr_font_family: z.string(),
});

const FONT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

function QRCodePage() {
  const { toast } = useToast();
  const [widgetUrl, setWidgetUrl] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qr_background_color: "#faae2b",
      qr_barcode_color: "#000000",
      qr_label_top: "",
      qr_label_bottom: "",
      qr_font_family: "default",
    },
  });

  const bgColor = form.watch("qr_background_color");
  const barcodeColor = form.watch("qr_barcode_color");
  const labelTop = form.watch("qr_label_top");
  const labelBottom = form.watch("qr_label_bottom");
  const fontFamily = form.watch("qr_font_family");
  const donationUrl = widgetUrl
    ? widgetUrl.replace(/\/widget\/qrcode.*/, "")
    : Env.APP_URL;

  React.useEffect(() => {
    $axios
      .get<{ data: OverlaySettings }>(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const s = res.data.data;
        form.reset({
          qr_background_color: s.qr_background_color || "#faae2b",
          qr_barcode_color: s.qr_barcode_color || "#000000",
          qr_label_top: s.qr_label_top || "",
          qr_label_bottom: s.qr_label_bottom || "",
          qr_font_family: s.qr_font_family || "default",
        });
        if (s.stream_key) {
          setWidgetUrl(`${Env.APP_URL}/widget/qrcode?key=${s.stream_key}`);
        }
      })
      .catch(() => {
        toast({ title: "Gagal memuat pengaturan", variant: "destructive" });
      });
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(OVERLAY_QR_ENDPOINT, values);
      toast({ title: "Tampilan QR Code berhasil disimpan!" });
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
      setWidgetUrl(`${Env.APP_URL}/widget/qrcode?key=${key}`);
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
    <div className="flex gap-x-8">
      {/* ── Left: Form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-y-6">
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
                <div className="flex gap-x-5 flex-wrap gap-y-4">
                  <FormField
                    name="qr_background_color"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="w-full md:w-[calc(50%-10px)]">
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
                    name="qr_barcode_color"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="w-full md:w-[calc(50%-10px)]">
                        <FormLabel>Warna Barcode:</FormLabel>
                        <FormControl>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {field.value}
                            </p>
                            <ColorPicker
                              value={field.value}
                              setValue={(v) => field.onChange(v ?? "#000000")}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name="qr_label_top"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label atas:</FormLabel>
                      <FormControl>
                        <Input placeholder="Label di atas QR Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="qr_label_bottom"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label bawah:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Label di bawah QR Code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="qr_font_family"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font isi:</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih font" />
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

        {/* ── Widget URL Card ─────────────────────────────────── */}
        <Card className="bg-gray-50 p-1">
          <CardHeader className="font-sans text-xl font-semibold">
            <h2>URL Widget QR Code:</h2>
          </CardHeader>
          <CardContent className="font-sans flex flex-col gap-y-3">
            <p className="text-sm text-muted-foreground break-all">
              {widgetUrl}
            </p>
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

      {/* ── Right: Preview ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col items-center gap-y-4 w-[260px] shrink-0">
        <p className="font-mono text-sm text-muted-foreground">Preview</p>
        <div
          className="flex flex-col items-center gap-y-2 p-4 rounded-md border border-gray-200 w-full shadow-normal"
          style={{
            backgroundColor: bgColor,
            fontFamily: fontFamily === "default" ? undefined : fontFamily,
          }}
        >
          {labelTop && (
            <p
              className="text-sm font-semibold text-center"
              style={{ color: barcodeColor }}
            >
              {labelTop}
            </p>
          )}
          <QRCode
            value={donationUrl}
            size={180}
            bgColor={bgColor}
            fgColor={barcodeColor}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
          {labelBottom && (
            <p
              className="text-sm font-semibold text-center"
              style={{ color: barcodeColor }}
            >
              {labelBottom}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRCodePage;

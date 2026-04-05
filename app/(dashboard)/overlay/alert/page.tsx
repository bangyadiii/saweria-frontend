"use client";
import FilterKataForm from "@/components/overlay/alert/FilterKataForm";
import NotificationSound from "@/components/overlay/alert/NotificationSound";
import TemplateForm from "@/components/overlay/alert/TemplateForm";
import ControlPanel from "@/components/overlay/ControlPanel";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import {
  OVERLAY_ALERT_ENDPOINT,
  OVERLAY_SETTINGS_ENDPOINT,
  OVERLAY_STREAM_KEY_RESET_ENDPOINT,
} from "@/lib/api-endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink } from "lucide-react";
import Env from "@/lib/env";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  gif_setting: z.boolean(),
  tts_variant: z.string().nullable(),
  minimum_alert: z.coerce.number(),
  minimum_mediashare: z.coerce.number(),
  minimum_tts: z.coerce.number(),
});

type OverlaySettings = {
  gif_setting: boolean;
  tts_variant: string | null;
  minimum_alert: number;
  minimum_mediashare: number;
  minimum_tts: number;
  background_color: string | null;
  highlight_color: string | null;
  text_color: string | null;
  template_text: string;
  notification_duration: number | null;
  filter_kata: string | null;
  sound_url: string | null;
  stream_key: string | null;
};

function Alert() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<OverlaySettings | null>(null);

  const [widgetUrl, setWidgetUrl] = React.useState("");

  const resetStreamKey = async () => {
    try {
      const res = await $axios.post<{ data: { streamKey: string } }>(
        OVERLAY_STREAM_KEY_RESET_ENDPOINT,
      );
      const key = res.data.data.streamKey;
      setWidgetUrl(`${Env.APP_URL}/widget/alert?key=${key}`);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gif_setting: false,
      tts_variant: "",
      minimum_alert: 0,
      minimum_mediashare: 0,
      minimum_tts: 0,
    },
  });

  React.useEffect(() => {
    $axios
      .get<{ data: OverlaySettings }>(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const s = res.data.data;
        setSettings(s);
        if (s.stream_key) {
          setWidgetUrl(`${Env.APP_URL}/widget/alert?key=${s.stream_key}`);
        }
        form.reset({
          gif_setting: s.gif_setting,
          tts_variant: s.tts_variant ?? "",
          minimum_alert: s.minimum_alert,
          minimum_mediashare: s.minimum_mediashare,
          minimum_tts: s.minimum_tts,
        });
      });
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(OVERLAY_ALERT_ENDPOINT, values);
      toast({ title: "Aturan alert berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const templateInitialValues = React.useMemo(
    () => ({
      background_color: settings?.background_color ?? "",
      highlight_color: settings?.highlight_color ?? "",
      text_color: settings?.text_color ?? "",
      template_text:
        settings?.template_text ?? "[nama] baru saja memberikan [nominal]",
      notification_duration: settings?.notification_duration ?? 0,
    }),
    [settings],
  );

  return (
    <div className="flex flex-col gap-y-10">
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>Aturan Alert:</h2>
        </CardHeader>
        <CardContent className="font-sans">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex">
                <FormField
                  control={form.control}
                  name="gif_setting"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2">
                      <FormLabel>Nyalakan gif:</FormLabel>
                      <FormControl>
                        <div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="tts_variant"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2">
                      <FormLabel>Variant Suara Text To Speech (TTS)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="variant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">Non aktif</SelectItem>
                            <SelectItem value="indonesia">Indonesia</SelectItem>
                            <SelectItem value="inggris">Inggris</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <h2 className="font-sans text-xl font-semibold">
                Aturan Minimum:
              </h2>
              <div className="flex gap-x-5">
                <FormField
                  name="minimum_alert"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Alert notifikasi:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span>Rp</span>
                          <Input {...field} type="number" placeholder="20000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="minimum_mediashare"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>GIF / media share:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span>Rp</span>
                          <Input {...field} type="number" placeholder="20000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="minimum_tts"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Text to Speech:</FormLabel>
                      <FormControl>
                        <div className="flex items-baseline">
                          <span>Rp</span>
                          <Input {...field} type="number" placeholder="20000" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="mt-5">
                Simpan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <NotificationSound soundUrl={settings?.sound_url ?? null} />
      <FilterKataForm initialValue={settings?.filter_kata ?? ""} />
      <TemplateForm initialValues={templateInitialValues} />
      <ControlPanel title="Kontrol Alert" showTest />

      {/* URL Widget Alert */}
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>URL Widget Alert:</h2>
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

export default Alert;

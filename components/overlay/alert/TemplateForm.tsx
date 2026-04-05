"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import ColorPicker from "@/components/color-picker";
import AlertPreview, { PreviewProps } from "./AlertPreview";
import $axios from "@/lib/axios";
import { OVERLAY_TEMPLATE_ENDPOINT } from "@/lib/api-endpoints";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_TEMPLATE = "[nama] baru saja memberikan [nominal]";

const formSchema = z.object({
  background_color: z.string().nullable(),
  highlight_color: z.string().nullable(),
  text_color: z.string().nullable(),
  template_text: z.string(),
  notification_duration: z.coerce.number().nullable(),
});

type TemplateFormProps = {
  initialValues?: {
    background_color: string | null;
    highlight_color: string | null;
    text_color: string | null;
    template_text: string;
    notification_duration: number | null;
  };
};

function TemplateForm({ initialValues }: TemplateFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      background_color: "",
      highlight_color: "",
      text_color: "",
      template_text: DEFAULT_TEMPLATE,
      notification_duration: 0,
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      form.reset({
        background_color: initialValues.background_color ?? "",
        highlight_color: initialValues.highlight_color ?? "",
        text_color: initialValues.text_color ?? "",
        template_text: initialValues.template_text || DEFAULT_TEMPLATE,
        notification_duration: initialValues.notification_duration ?? 0,
      });
      setSetting({
        backgroundColor: initialValues.background_color,
        highlightColor: initialValues.highlight_color,
        textColor: initialValues.text_color,
        templateText: initialValues.template_text || DEFAULT_TEMPLATE,
      });
    }
  }, [initialValues, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await $axios.put(OVERLAY_TEMPLATE_ENDPOINT, values);
      toast({ title: "Template berhasil disimpan" });
    } catch {
      toast({ title: "Gagal menyimpan template", variant: "destructive" });
    }
  };

  const onReset = () => {
    form.setValue("template_text", DEFAULT_TEMPLATE);
    form.setValue("background_color", "");
    form.setValue("highlight_color", "");
    form.setValue("text_color", "");
    form.setValue("notification_duration", 0);
    setSetting({
      backgroundColor: null,
      highlightColor: null,
      textColor: null,
      templateText: DEFAULT_TEMPLATE,
    });
  };

  const [setting, setSetting] = React.useState<PreviewProps>({
    backgroundColor: null,
    highlightColor: null,
    textColor: null,
    templateText: DEFAULT_TEMPLATE,
  });

  return (
    <>
      <AlertPreview {...setting} />
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <span>
            Tampilan:
            <ActionTooltip label="Kembalikan setting ke default">
              <RotateCw className="hover:animate-spin" onClick={onReset} />
            </ActionTooltip>
          </span>
        </CardHeader>
        <CardContent className="font-sans">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-x-5">
                <FormField
                  name="background_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Warna Background</FormLabel>
                      <FormControl>
                        <div className="flex flex-col">
                          <Input {...field} value={field.value ?? ""} />
                          <ColorPicker
                            value={field.value}
                            setValue={(hexColor) => {
                              setSetting((prev) => ({
                                ...prev,
                                backgroundColor: hexColor,
                              }));
                              form.setValue("background_color", hexColor);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="highlight_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Warna Highlight</FormLabel>
                      <FormControl>
                        <div className="flex flex-col">
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            type="text"
                          />
                          <ColorPicker
                            value={field.value}
                            setValue={(hexColor) => {
                              setSetting((prev) => ({
                                ...prev,
                                highlightColor: hexColor,
                              }));
                              form.setValue("highlight_color", hexColor);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="text_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Warna Text:</FormLabel>
                      <FormControl>
                        <div className="flex flex-col">
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            type="text"
                          />
                          <ColorPicker
                            value={field.value}
                            setValue={(hexColor) => {
                              setSetting((prev) => ({
                                ...prev,
                                textColor: hexColor,
                              }));
                              form.setValue("text_color", hexColor);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-x-5 mt-4">
                <FormField
                  name="template_text"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Template Teks:</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            form.setValue("template_text", e.target.value);
                            setSetting((prev) => ({
                              ...prev,
                              templateText: e.target.value,
                            }));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Gunakan <code>{"[nama]"}</code> untuk menampilkan nama
                        pengirim.
                        <br />
                        Gunakan <code>{"[nominal]"}</code> untuk menampilkan
                        nominal pengirim.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="notification_duration"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Durasi Notifikasi</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? 0}
                          type="number"
                        />
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
    </>
  );
}

export default TemplateForm;

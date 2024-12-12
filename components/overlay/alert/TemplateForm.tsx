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

const formSchema = z.object({
  background_color: z.string().nullable(),
  highlight_color: z.string().nullable(),
  text_color: z.string().nullable(),
  template_text: z.string(),
  notification_duration: z.number().nullable(),
});

function TemplateForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      background_color: "",
      highlight_color: "",
      text_color: "",
      template_text: "[nama] baru saja memberikan [nominal]",
      notification_duration: 0,
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  const [setting, setSetting] = React.useState<PreviewProps>({
    backgroundColor: null,
    highlightColor: null,
    textColor: null,
    templateText: "[nama] baru saja memberikan [nominal]",
  });

  return (
    <>
      <AlertPreview {...setting} />
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <span>
            Tampilan:
            <ActionTooltip label="Kembalikan setting ke default">
              <RotateCw className="hover:animate-spin" />
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
                              setSetting({
                                ...setting,
                                backgroundColor: hexColor,
                              });
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
                              setSetting({
                                ...setting,
                                highlightColor: hexColor,
                              });
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
                              setSetting({
                                ...setting,
                                textColor: hexColor,
                              });
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
                          onChange={(...event: any[]) => {
                            form.setValue(
                              "template_text",
                              event[0].target.value
                            );
                            setSetting({
                              ...setting,
                              templateText: event[0].target.value,
                            });
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

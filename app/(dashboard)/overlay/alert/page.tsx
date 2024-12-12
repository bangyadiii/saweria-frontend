"use client";
import FilterKataForm from "@/components/overlay/alert/FilterKataForm";
import NotificationSound from "@/components/overlay/alert/NotificationSound";
import TemplateForm from "@/components/overlay/alert/TemplateForm";
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
import { zodResolver } from "@hookform/resolvers/zod";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  gif_setting: z.boolean(),
  tts_variant: z.string().nullable(),
  minimum_alert: z.number(),
  minimum_mediashare: z.number(),
  minimum_tts: z.number(),
});

function Alert() {
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

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
      <NotificationSound />
      <FilterKataForm />
      <TemplateForm />
    </div>
  );
}

export default Alert;

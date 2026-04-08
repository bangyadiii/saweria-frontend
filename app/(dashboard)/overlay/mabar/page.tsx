"use client";

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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import {
  OVERLAY_MABAR_ENDPOINT,
  OVERLAY_SETTINGS_ENDPOINT,
} from "@/lib/api-endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Schema ────────────────────────────────────────────────────────────────

const formSchema = z.object({
  mabar_enabled: z.boolean(),
  mabar_keyword: z.string().min(1, "Keyword tidak boleh kosong"),
  mabar_minimum_amount: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
  mabar_gold_threshold: z.coerce.number().min(0),
  mabar_silver_threshold: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: FormValues = {
  mabar_enabled: false,
  mabar_keyword: "!mabar",
  mabar_minimum_amount: 10000,
  mabar_gold_threshold: 50000,
  mabar_silver_threshold: 20000,
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default function MabarSettingsPage() {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Load current settings on mount
  useEffect(() => {
    $axios
      .get(OVERLAY_SETTINGS_ENDPOINT)
      .then((res) => {
        const d = res.data?.data;
        if (!d) return;
        form.reset({
          mabar_enabled: d.mabar_enabled ?? false,
          mabar_keyword: d.mabar_keyword ?? "!mabar",
          mabar_minimum_amount: d.mabar_minimum_amount ?? 10000,
          mabar_gold_threshold: d.mabar_gold_threshold ?? 50000,
          mabar_silver_threshold: d.mabar_silver_threshold ?? 20000,
        });
      })
      .catch(() => {
        // silently ignore; defaults will be used
      });
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await $axios.put(OVERLAY_MABAR_ENDPOINT, values);
      toast({
        title: "Tersimpan",
        description: "Pengaturan mabar berhasil disimpan.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan.",
        variant: "destructive",
      });
    }
  };

  const enabled = form.watch("mabar_enabled");

  return (
    <div className="flex flex-col gap-y-10">
      <Card className="bg-gray-50 p-1">
        <CardHeader className="font-sans text-xl font-semibold">
          <h2>Pengaturan Mabar:</h2>
        </CardHeader>
        <CardContent className="font-sans">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Enable switch */}
              <FormField
                control={form.control}
                name="mabar_enabled"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Aktifkan fitur mabar:</FormLabel>
                    <FormControl>
                      <div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Donatur yang mengirim pesan dengan kata kunci tertentu dan
                      nominal minimum akan otomatis masuk ke antrian mabar.
                    </p>
                  </FormItem>
                )}
              />

              {/* Keyword */}
              <FormField
                control={form.control}
                name="mabar_keyword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Kata Kunci:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="!mabar"
                        disabled={!enabled}
                        className="max-w-xs"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Pesan harus diawali kata kunci ini diikuti username
                      in-game. Contoh: &quot;!mabar PlayerXYZ&quot;
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minimum amount */}
              <FormField
                control={form.control}
                name="mabar_minimum_amount"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Nominal Minimum (Rp):</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        disabled={!enabled}
                        className="max-w-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tier thresholds */}
              <h3 className="font-semibold mb-3">Priority Tier Threshold:</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                <FormField
                  control={form.control}
                  name="mabar_gold_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-yellow-400 border border-black" />
                        Gold — minimal Rp
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          disabled={!enabled}
                          className="w-40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mabar_silver_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-gray-300 border border-black" />
                        Silver — minimal Rp
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          disabled={!enabled}
                          className="w-40"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Di bawah Silver = Bronze
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                Simpan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

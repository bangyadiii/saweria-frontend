"use client";

import React, { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import $axios from "@/lib/axios";
import { DONATE_ENDPOINT, PUBLIC_PROFILE_ENDPOINT } from "@/lib/api-endpoints";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  donor_name: z.string().min(1, "Nama wajib diisi"),
  amount: z.coerce.number().min(1000, "Minimal Rp 1.000"),
  message: z.string().max(300).optional(),
  media_url: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v ||
        /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com)/.test(v),
      "Hanya URL YouTube atau TikTok yang diizinkan",
    ),
  payment_type: z.string().min(1, "Pilih metode pembayaran"),
  bank: z.string().optional(),
});

type ChargeResponse = {
  order_id: string;
  payment_type: string;
  bank?: string;
  va_number?: string;
  biller_code?: string;
  bill_key?: string;
  qr_code_url?: string;
  deep_link_url?: string;
};

type PublicProfile = {
  username: string;
  display_name?: string;
  profile_image?: string;
};

export default function DonationPage({
  params,
}: Readonly<{ params: Promise<{ username: string }> }>) {
  const { username } = use(params);
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [chargeResult, setChargeResult] = React.useState<ChargeResponse | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donor_name: "",
      amount: 10000,
      message: "",
      media_url: "",
      payment_type: "",
      bank: "",
    },
  });

  const paymentType = form.watch("payment_type");

  React.useEffect(() => {
    $axios
      .get<{ data: PublicProfile }>(PUBLIC_PROFILE_ENDPOINT(username))
      .then((res) => setProfile(res.data.data))
      .catch(() => setProfile({ username: username }));
  }, [username]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await $axios.post<{ data: ChargeResponse }>(
        DONATE_ENDPOINT(username),
        values,
      );
      setChargeResult(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Terjadi kesalahan";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (chargeResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Selesaikan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-semibold">Order ID:</span>{" "}
              {chargeResult.order_id}
            </p>
            {chargeResult.va_number && (
              <p>
                <span className="font-semibold">
                  Nomor VA {chargeResult.bank?.toUpperCase()}:
                </span>{" "}
                {chargeResult.va_number}
              </p>
            )}
            {chargeResult.biller_code && (
              <>
                <p>
                  <span className="font-semibold">Biller Code:</span>{" "}
                  {chargeResult.biller_code}
                </p>
                <p>
                  <span className="font-semibold">Bill Key:</span>{" "}
                  {chargeResult.bill_key}
                </p>
              </>
            )}
            {chargeResult.qr_code_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={chargeResult.qr_code_url}
                alt="QR Code"
                className="w-40 h-40 mx-auto"
              />
            )}
            {chargeResult.deep_link_url && (
              <a
                href={chargeResult.deep_link_url}
                className="text-blue-600 underline text-center"
              >
                Buka di aplikasi
              </a>
            )}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setChargeResult(null)}
            >
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      {/* Streamer profile */}
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-20 h-20 mb-2">
          <AvatarImage src={profile?.profile_image} />
          <AvatarFallback>
            {(profile?.display_name ?? profile?.username ?? "?")
              .charAt(0)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">
          {profile?.display_name ?? profile?.username ?? username}
        </h1>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Kirim Dukungan</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                name="donor_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama kamu</FormLabel>
                    <FormControl>
                      <Input placeholder="Budi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal (Rp)</FormLabel>
                    <FormControl>
                      <div className="flex items-baseline gap-1">
                        <span>Rp</span>
                        <Input type="number" placeholder="10000" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="message"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesan (opsional, maks 300 karakter)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Semangat streamnya!"
                        maxLength={300}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="media_url"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link YouTube / TikTok (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="payment_type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">
                            Transfer Bank
                          </SelectItem>
                          <SelectItem value="echannel">
                            Mandiri e-Channel
                          </SelectItem>
                          <SelectItem value="gopay">GoPay</SelectItem>
                          <SelectItem value="shopeepay">ShopeePay</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentType === "bank_transfer" && (
                <FormField
                  name="bank"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Bank</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bca">BCA</SelectItem>
                            <SelectItem value="bni">BNI</SelectItem>
                            <SelectItem value="bri">BRI</SelectItem>
                            <SelectItem value="permata">Permata</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? "Memproses..." : "Kirim Dukungan"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

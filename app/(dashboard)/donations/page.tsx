"use client";

import React from "react";
import $axios from "@/lib/axios";
import {
  DONATIONS_ENDPOINT,
  WALLET_BALANCE_ENDPOINT,
  WALLET_CASHOUT_ENDPOINT,
  WALLET_CASHOUT_HISTORY_ENDPOINT,
} from "@/lib/api-endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  message?: string;
  payment_status: string;
  created_at: string;
};

type Cashout = {
  id: string;
  amount: number;
  net_amount: number;
  bank_name: string;
  account_number: string;
  status: string;
  created_at: string;
};

const cashoutSchema = z.object({
  amount: z.coerce.number().min(50000, "Minimal cashout Rp 50.000"),
  bank_name: z.string().min(1, "Nama bank wajib diisi"),
  account_number: z.string().min(1, "Nomor rekening wajib diisi"),
  account_name: z.string().min(1, "Nama pemilik rekening wajib diisi"),
});

function fmt(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-700",
    processed: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100"}`}
    >
      {status}
    </span>
  );
}

export default function DonationsPage() {
  const { toast } = useToast();
  const [balance, setBalance] = React.useState<number>(0);
  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [cashouts, setCashouts] = React.useState<Cashout[]>([]);
  const [showCashoutForm, setShowCashoutForm] = React.useState(false);

  const form = useForm<z.infer<typeof cashoutSchema>>({
    resolver: zodResolver(cashoutSchema),
    defaultValues: {
      amount: 50000,
      bank_name: "",
      account_number: "",
      account_name: "",
    },
  });

  const fetchAll = React.useCallback(() => {
    $axios
      .get<{ data: { balance: number } }>(WALLET_BALANCE_ENDPOINT)
      .then((r) => setBalance(r.data.data.balance));
    $axios
      .get<{ data: Donation[] }>(DONATIONS_ENDPOINT)
      .then((r) => setDonations(r.data.data ?? []));
    $axios
      .get<{ data: Cashout[] }>(WALLET_CASHOUT_HISTORY_ENDPOINT)
      .then((r) => setCashouts(r.data.data ?? []));
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onCashout = async (values: z.infer<typeof cashoutSchema>) => {
    try {
      await $axios.post(WALLET_CASHOUT_ENDPOINT, values);
      toast({ title: "Permintaan cashout berhasil dikirim" });
      setShowCashoutForm(false);
      form.reset();
      fetchAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal cashout";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo Tersedia</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-3xl font-bold">{fmt(balance)}</span>
          <Button onClick={() => setShowCashoutForm((v) => !v)}>
            {showCashoutForm ? "Batal" : "Cashout"}
          </Button>
        </CardContent>
      </Card>

      {/* Cashout form */}
      {showCashoutForm && (
        <Card>
          <CardHeader>
            <CardTitle>Formulir Cashout</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCashout)}
                className="flex flex-col gap-4"
              >
                <FormField
                  name="amount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nominal (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="bank_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="BCA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="account_number"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="account_name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pemilik Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Ajukan Cashout</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Donation history */}
      <Card>
        <CardHeader>
          <CardTitle>Histori Donasi Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada donasi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Donor</th>
                    <th className="py-2 pr-4">Nominal</th>
                    <th className="py-2 pr-4">Pesan</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{d.donor_name}</td>
                      <td className="py-2 pr-4">{fmt(d.amount)}</td>
                      <td className="py-2 pr-4 text-gray-500 max-w-[180px] truncate">
                        {d.message || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {statusBadge(d.payment_status)}
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(d.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cashout history */}
      <Card>
        <CardHeader>
          <CardTitle>Histori Cashout</CardTitle>
        </CardHeader>
        <CardContent>
          {cashouts.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada cashout.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Bank</th>
                    <th className="py-2 pr-4">Rekening</th>
                    <th className="py-2 pr-4">Nominal</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {cashouts.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{c.bank_name}</td>
                      <td className="py-2 pr-4">{c.account_number}</td>
                      <td className="py-2 pr-4">{fmt(c.net_amount)}</td>
                      <td className="py-2 pr-4">{statusBadge(c.status)}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

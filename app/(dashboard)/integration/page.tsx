"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import $axios from "@/lib/axios";
import {
  ME_ENDPOINT,
  ME_WEBHOOK_ENDPOINT,
  ME_WEBHOOK_RESET_TOKEN_ENDPOINT,
  ME_WEBHOOK_TEST_ENDPOINT,
} from "@/lib/api-endpoints";

interface WebhookSettings {
  webhookEnabled: boolean;
  webhookUrl: string | null;
  webhookToken: string | null;
}

export default function IntegrationPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const username = session?.user?.username ?? "";

  const donationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `/${username}`;

  // Webhook state
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [resettingToken, setResettingToken] = useState(false);

  // Load current settings
  useEffect(() => {
    $axios.get(ME_ENDPOINT).then((res) => {
      const data: WebhookSettings = res.data.data;
      setWebhookEnabled(data.webhookEnabled ?? false);
      setWebhookUrl(data.webhookUrl ?? "");
      setWebhookToken(data.webhookToken ?? "");
    });
  }, []);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} disalin` });
  };

  const saveWebhook = async () => {
    setSavingWebhook(true);
    try {
      const res = await $axios.put(ME_WEBHOOK_ENDPOINT, {
        enabled: webhookEnabled,
        url: webhookUrl || null,
      });
      const data: WebhookSettings = res.data.data;
      setWebhookEnabled(data.webhookEnabled);
      setWebhookUrl(data.webhookUrl ?? "");
      setWebhookToken(data.webhookToken ?? "");
      toast({ title: "Pengaturan webhook disimpan" });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Terjadi kesalahan";
      toast({ title: "Gagal menyimpan", description: msg, variant: "destructive" });
    } finally {
      setSavingWebhook(false);
    }
  };

  const resetToken = async () => {
    setResettingToken(true);
    try {
      const res = await $axios.post(ME_WEBHOOK_RESET_TOKEN_ENDPOINT);
      const data: WebhookSettings = res.data.data;
      setWebhookToken(data.webhookToken ?? "");
      toast({ title: "Token baru berhasil dibuat" });
    } catch {
      toast({ title: "Gagal mereset token", variant: "destructive" });
    } finally {
      setResettingToken(false);
    }
  };

  const testWebhook = async () => {
    setTestingWebhook(true);
    try {
      await $axios.post(ME_WEBHOOK_TEST_ENDPOINT);
      toast({ title: "Notifikasi tes berhasil dikirim" });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Terjadi kesalahan";
      toast({ title: "Gagal mengirim notifikasi tes", description: msg, variant: "destructive" });
    } finally {
      setTestingWebhook(false);
    }
  };

  const codeExample = `const crypto = require('crypto');

const computedSignature = crypto
   .createHmac("sha256", webhookToken)
   .update(JSON.stringify(webhookBody))
   .digest("hex");

return crypto.timingSafeEqual(
   Buffer.from(computedSignature),
   Buffer.from(takoSignatureFromHeader)
);`;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Integration</h1>

      {/* Donation link */}
      <Card>
        <CardHeader>
          <CardTitle>Link Donasi Publik</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={donationUrl} readOnly />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copy(donationUrl, "Link donasi")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Notifikasi Webhook</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tako akan mengirimkan data HTTP POST ke webhook URL mu setiap ada
            dukungan masuk. Kamu dapat memproses data ini dan membuat interaksi
            dukungan lebih menarik!
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="webhook-enabled"
              checked={webhookEnabled}
              onCheckedChange={setWebhookEnabled}
            />
            <label
              htmlFor="webhook-enabled"
              className="text-sm font-medium cursor-pointer"
            >
              Nyalakan Webhook
            </label>
          </div>

          {/* Webhook URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Webhook URL</label>
            <Input
              placeholder="https://callbackdestination.com/webhook/xxxxxx"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              URL harus diawali dengan http(s)://
            </p>
          </div>

          {/* Webhook Token */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Webhook Token</label>
            <div className="flex gap-2">
              <Input value={webhookToken} readOnly className="font-mono" />
              <Button
                variant="outline"
                onClick={resetToken}
                disabled={resettingToken}
                className="shrink-0"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(webhookToken, "Webhook token")}
                disabled={!webhookToken}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={saveWebhook} disabled={savingWebhook}>
              {savingWebhook ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              variant="outline"
              onClick={testWebhook}
              disabled={testingWebhook || !webhookUrl}
            >
              {testingWebhook ? "Mengirim..." : "Tes Notifikasi"}
            </Button>
          </div>

          {/* Validation guide collapsible */}
          <div className="border rounded-md">
            <button
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left"
              onClick={() => setShowValidation((v) => !v)}
            >
              <span>Cara Memvalidasi Webhook</span>
              {showValidation ? (
                <ChevronUp className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0" />
              )}
            </button>
            {showValidation && (
              <div className="px-4 pb-4 flex flex-col gap-3 text-sm text-muted-foreground border-t">
                <p className="mt-3">
                  Validasi webhook menggunakan header{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">
                    X-Tako-Signature
                  </code>
                  . Apabila webhook token tidak diisi, maka header ini akan
                  dikosongkan.
                </p>
                <p>
                  Gunakan algoritma HMAC SHA-256 untuk membuat signature dari
                  body webhook dan token. Bandingkan signature yang dihasilkan
                  dengan signature yang diterima dari header. Contoh
                  implementasi di Node.js:
                </p>
                <pre className="bg-muted rounded-md p-3 overflow-x-auto text-xs font-mono text-foreground">
                  {codeExample}
                </pre>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    <code className="font-mono">webhookToken</code>: Token
                    webhook asli dari dashboard
                  </li>
                  <li>
                    <code className="font-mono">webhookBody</code>: Isi body
                    dari webhook
                  </li>
                  <li>
                    <code className="font-mono">takoSignatureFromHeader</code>:
                    Konten signature yang diterima dari header{" "}
                    <code className="font-mono">X-Tako-Signature</code>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

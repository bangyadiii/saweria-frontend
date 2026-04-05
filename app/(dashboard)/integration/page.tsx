"use client";

import React from "react";
import { useSession } from "next-auth/react";
import $axios from "@/lib/axios";
import { OVERLAY_STREAM_KEY_RESET_ENDPOINT } from "@/lib/api-endpoints";
import Env from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw } from "lucide-react";

export default function IntegrationPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [streamKey, setStreamKey] = React.useState<string | null>(null);
  const [resetting, setResetting] = React.useState(false);

  const username = session?.user?.username ?? "";
  const apiBase = Env.SERVER_ENDPOINT;
  const wsBase = Env.WS_URL;

  const donationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `/${username}`;

  const obsAlertUrl =
    streamKey && typeof window !== "undefined"
      ? `${window.location.origin}/obs/alert?key=${streamKey}`
      : "";

  const obsMediaUrl =
    streamKey && typeof window !== "undefined"
      ? `${window.location.origin}/obs/mediashare?key=${streamKey}`
      : "";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} disalin` });
  };

  const resetStreamKey = async () => {
    setResetting(true);
    try {
      const res = await $axios.post<{ data: { stream_key: string } }>(
        OVERLAY_STREAM_KEY_RESET_ENDPOINT,
      );
      setStreamKey(res.data.data.stream_key);
      toast({ title: "Stream key berhasil direset. Simpan key ini!" });
    } catch {
      toast({ title: "Gagal reset stream key", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

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

      {/* Stream key */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Key</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            Stream key digunakan untuk menghubungkan overlay OBS. Hanya tampil
            sekali setelah reset.
          </p>
          {streamKey && (
            <div className="flex gap-2">
              <Input value={streamKey} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copy(streamKey, "Stream key")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
          <Button
            variant="destructive"
            disabled={resetting}
            onClick={resetStreamKey}
            className="w-fit"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {resetting ? "Mereset..." : "Reset Stream Key"}
          </Button>
        </CardContent>
      </Card>

      {/* OBS URLs */}
      <Card>
        <CardHeader>
          <CardTitle>URL Overlay OBS</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Reset stream key terlebih dahulu, lalu salin URL di bawah ke OBS
            Browser Source.
          </p>
          <div>
            <p className="text-sm font-semibold mb-1">Alert</p>
            <div className="flex gap-2">
              <Input
                value={obsAlertUrl || "— reset stream key dulu —"}
                readOnly
                className="text-xs"
              />
              {obsAlertUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copy(obsAlertUrl, "URL Alert OBS")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">MediaShare</p>
            <div className="flex gap-2">
              <Input
                value={obsMediaUrl || "— reset stream key dulu —"}
                readOnly
                className="text-xs"
              />
              {obsMediaUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copy(obsMediaUrl, "URL MediaShare OBS")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">QR Code donasi</p>
            {username && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${apiBase}/widgets/info?streamKey=${streamKey ?? ""}`}
                alt="QR"
                className="w-32 h-32 border rounded"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* WebSocket endpoint info */}
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={`${wsBase}/ws?key=<stream_key>`}
            readOnly
            className="text-xs font-mono"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copy(`${wsBase}/ws?key=<stream_key>`, "WS endpoint")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

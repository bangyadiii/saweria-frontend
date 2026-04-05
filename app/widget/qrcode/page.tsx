"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import Env from "@/lib/env";
import { WIDGET_INFO_ENDPOINT } from "@/lib/api-endpoints";

type OverlaySettings = {
  qr_background_color: string;
  qr_barcode_color: string;
  qr_label_top: string;
  qr_label_bottom: string;
  qr_font_family: string;
};

type InfoResponse = {
  username: string;
  overlaySettings: OverlaySettings;
};

export default function WidgetQrcodePage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [info, setInfo] = React.useState<InfoResponse | null>(null);
  const retryRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!streamKey) return;

    let cancelled = false;

    async function fetchInfo() {
      try {
        const res = await fetch(WIDGET_INFO_ENDPOINT(streamKey));
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        if (!cancelled) setInfo(json.data);
      } catch {
        // retry every 5 seconds until the backend is reachable
        if (!cancelled) {
          retryRef.current = setTimeout(fetchInfo, 5000);
        }
      }
    }

    fetchInfo();

    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [streamKey]);

  if (!streamKey || !info) return null;

  const s = info.overlaySettings ?? {};
  const bg = s.qr_background_color || "#ffffff";
  const fg = s.qr_barcode_color || "#000000";
  const ff = s.qr_font_family || "inherit";
  const labelTop = s.qr_label_top || "";
  const labelBottom = s.qr_label_bottom || "";
  const donationUrl = `${Env.APP_URL}/${info.username}`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "transparent" }}
    >
      <div
        className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl"
        style={{ backgroundColor: bg, fontFamily: ff }}
      >
        {labelTop && (
          <p className="text-sm font-semibold" style={{ color: fg }}>
            {labelTop}
          </p>
        )}
        <QRCode value={donationUrl} fgColor={fg} bgColor={bg} size={200} />
        {labelBottom && (
          <p className="text-sm font-semibold" style={{ color: fg }}>
            {labelBottom}
          </p>
        )}
      </div>
    </div>
  );
}

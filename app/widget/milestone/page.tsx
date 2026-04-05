"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Env from "@/lib/env";
import { WIDGET_INFO_ENDPOINT } from "@/lib/api-endpoints";

type OverlaySettings = {
  ms_title: string;
  ms_target: number;
  ms_bg_color: string;
  ms_text_color_ms: string;
  ms_no_border_ms: boolean;
  ms_font_weight_ms: number;
  ms_font_title: string;
  ms_font_content: string;
};

type InfoResponse = {
  username: string;
  totalRaised: number;
  overlaySettings: OverlaySettings;
};

type DonationPayload = {
  type: "donation_alert";
  amount: number;
};

export default function WidgetMilestonePage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [info, setInfo] = React.useState<InfoResponse | null>(null);
  const [totalRaised, setTotalRaised] = React.useState(0);
  const wsRef = React.useRef<WebSocket | null>(null);
  const retryRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!streamKey) return;

    let cancelled = false;

    async function fetchInfo() {
      try {
        const res = await fetch(WIDGET_INFO_ENDPOINT(streamKey));
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setInfo(json.data);
          setTotalRaised(json.data.totalRaised ?? 0);
        }
      } catch {
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

  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload: DonationPayload = JSON.parse(event.data);
        if (payload.type === "donation_alert" && payload.amount > 0) {
          setTotalRaised((prev) => prev + payload.amount);
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
  }, [streamKey]);

  React.useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  if (!info) return null;

  const s = info.overlaySettings;
  const bg = s.ms_bg_color || "#1e1e2e";
  const tc = s.ms_text_color_ms || "#ffffff";
  const noBorder = s.ms_no_border_ms ?? false;
  const fw = s.ms_font_weight_ms || 600;
  const ffTitle = s.ms_font_title || "inherit";
  const ffContent = s.ms_font_content || "inherit";
  const title = s.ms_title || "Milestone";
  const target = s.ms_target || 1;

  const pct = Math.min(100, Math.round((totalRaised / target) * 100));

  return (
    <div
      className="fixed inset-0 flex items-end justify-center pointer-events-none"
      style={{ background: "transparent" }}
    >
      <div
        className="mb-10 w-full max-w-lg px-6 py-4 rounded-2xl"
        style={{
          backgroundColor: bg,
          color: tc,
          border: noBorder ? "none" : `2px solid ${tc}`,
        }}
      >
        {/* Title */}
        <p
          className="text-base mb-2"
          style={{ fontFamily: ffTitle, fontWeight: fw, color: tc }}
        >
          {title}
        </p>

        {/* Progress bar track */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: 16,
            backgroundColor: `${tc}30`,
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: tc }}
          />
        </div>

        {/* Amounts */}
        <div
          className="flex justify-between mt-2 text-sm"
          style={{ fontFamily: ffContent, color: tc }}
        >
          <span>Rp {totalRaised.toLocaleString("id-ID")}</span>
          <span>{pct}%</span>
          <span>Rp {target.toLocaleString("id-ID")}</span>
        </div>
      </div>
    </div>
  );
}

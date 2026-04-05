"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Env from "@/lib/env";
import {
  WIDGET_INFO_ENDPOINT,
  WIDGET_LEADERBOARD_ENDPOINT,
} from "@/lib/api-endpoints";

type OverlaySettings = {
  lb_title: string;
  lb_bg_color: string;
  lb_text_color: string;
  lb_font_weight: number;
  lb_no_border: boolean;
  lb_hide_amount: boolean;
  lb_font_title: string;
  lb_font_content: string;
  lb_time_range: string;
  lb_limit: number;
};

type InfoResponse = {
  overlaySettings: OverlaySettings;
};

type LeaderboardEntry = {
  donor_name: string;
  total: number;
};

type WSPayload = {
  type: string;
  action?: string;
};

export default function WidgetLeaderboardPage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [settings, setSettings] = React.useState<OverlaySettings | null>(null);
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const wsRef = React.useRef<WebSocket | null>(null);
  const retryInfoRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryLbRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLeaderboard = React.useCallback(
    async (s: OverlaySettings) => {
      if (!streamKey) return;
      try {
        const url =
          WIDGET_LEADERBOARD_ENDPOINT(streamKey) +
          `&limit=${s.lb_limit}&timeRange=${s.lb_time_range}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        setEntries(json.data ?? []);
      } catch {
        retryLbRef.current = setTimeout(() => fetchLeaderboard(s), 10000);
      }
    },
    [streamKey],
  );

  React.useEffect(() => {
    if (!streamKey) return;

    let cancelled = false;

    async function fetchInfo() {
      try {
        const res = await fetch(WIDGET_INFO_ENDPOINT(streamKey));
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          const s: OverlaySettings = json.data.overlaySettings;
          setSettings(s);
          fetchLeaderboard(s);
        }
      } catch {
        if (!cancelled) {
          retryInfoRef.current = setTimeout(fetchInfo, 5000);
        }
      }
    }

    fetchInfo();

    return () => {
      cancelled = true;
      if (retryInfoRef.current) clearTimeout(retryInfoRef.current);
      if (retryLbRef.current) clearTimeout(retryLbRef.current);
    };
  }, [streamKey, fetchLeaderboard]);

  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload: WSPayload = JSON.parse(event.data);
        // Refresh leaderboard when a donation comes in or control refresh
        if (
          payload.type === "donation_alert" ||
          (payload.type === "control" && payload.action === "refresh")
        ) {
          setSettings((prev) => {
            if (prev) fetchLeaderboard(prev);
            return prev;
          });
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
  }, [streamKey, fetchLeaderboard]);

  React.useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  if (!settings) return null;

  const bg = settings.lb_bg_color || "#faae2b";
  const tc = settings.lb_text_color || "#333333";
  const noBorder = settings.lb_no_border ?? false;
  const hideAmount = settings.lb_hide_amount ?? false;
  const fw = settings.lb_font_weight || 500;
  const ffTitle = settings.lb_font_title || "inherit";
  const ffContent = settings.lb_font_content || "inherit";
  const title = settings.lb_title || "Leaderboard";

  return (
    <div
      className="w-full pointer-events-none select-none"
      style={{ background: "transparent" }}
    >
      <div
        className={`w-full rounded-md overflow-hidden ${noBorder ? "" : "border-2 border-black"}`}
        style={{
          backgroundColor: bg,
          boxShadow: noBorder ? undefined : "6px 6px 0px 0px rgba(0,0,0,0.99)",
        }}
      >
        {/* Title */}
        <div className="px-5 pt-5 pb-2 text-center">
          <p
            className="text-3xl font-bold tracking-widest"
            style={{
              color: tc,
              fontFamily: ffTitle === "default" ? undefined : ffTitle,
              fontWeight: fw,
            }}
          >
            {title}
          </p>
        </div>

        {/* Entries */}
        <div className="flex flex-col px-5 pb-5 gap-y-2">
          {entries.length === 0 && (
            <p
              className="text-center text-lg py-4 opacity-60"
              style={{ color: tc }}
            >
              ...
            </p>
          )}
          {entries.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-x-3 rounded px-4 py-2"
              style={{ backgroundColor: `${tc}22` }}
            >
              <span
                className="text-xl font-bold w-8 text-center shrink-0"
                style={{
                  color: tc,
                  fontFamily: ffContent === "default" ? undefined : ffContent,
                  fontWeight: fw,
                }}
              >
                #{i + 1}
              </span>
              <span
                className="flex-1 truncate text-lg"
                style={{
                  color: tc,
                  fontFamily: ffContent === "default" ? undefined : ffContent,
                  fontWeight: fw,
                }}
              >
                {e.donor_name}
              </span>
              {!hideAmount && (
                <span
                  className="text-base shrink-0"
                  style={{
                    color: tc,
                    fontFamily: ffContent === "default" ? undefined : ffContent,
                    fontWeight: fw,
                  }}
                >
                  Rp{e.total.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

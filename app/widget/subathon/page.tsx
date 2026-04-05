"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Env from "@/lib/env";
import { WIDGET_INFO_ENDPOINT } from "@/lib/api-endpoints";

type TimeRule = {
  min_amount: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type SubathonSettings = {
  sub_initial_hours: number;
  sub_initial_minutes: number;
  sub_initial_seconds: number;
  sub_no_border: boolean;
  sub_bg_color: string;
  sub_auto_play: boolean;
  sub_text_color: string;
  sub_font_weight: number;
  sub_font_content: string;
  sub_time_rules: TimeRule[] | null;
};

type InfoResponse = {
  overlaySettings: SubathonSettings;
};

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function WidgetSubathonPage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [settings, setSettings] = React.useState<SubathonSettings | null>(null);
  const [totalSeconds, setTotalSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [addedNotif, setAddedNotif] = React.useState<string | null>(null);
  const notifTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const wsRef = React.useRef<WebSocket | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAdded = React.useCallback((addSeconds: number) => {
    if (addSeconds <= 0) return;
    const h = Math.floor(addSeconds / 3600);
    const m = Math.floor((addSeconds % 3600) / 60);
    const s = addSeconds % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}j`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}d`);
    setAddedNotif("+" + parts.join(" "));
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setAddedNotif(null), 4000);
  }, []);

  // Load initial settings
  React.useEffect(() => {
    if (!streamKey) return;
    let cancelled = false;

    async function fetchInfo() {
      try {
        const res = await fetch(WIDGET_INFO_ENDPOINT(streamKey));
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          const s: SubathonSettings = json.data.overlaySettings;
          setSettings(s);
          const initial =
            (s.sub_initial_hours || 0) * 3600 +
            (s.sub_initial_minutes || 0) * 60 +
            (s.sub_initial_seconds || 0);
          setTotalSeconds(initial);
          if (s.sub_auto_play) setRunning(true);
        }
      } catch {
        if (!cancelled) retryRef.current = setTimeout(fetchInfo, 5000);
      }
    }

    fetchInfo();
    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [streamKey]);

  // Countdown tick
  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 0) {
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // WebSocket — listen for donations to add time
  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "control") {
          if (payload.action === "refresh") window.location.reload();
          return;
        }
        // Authoritative timer state from BE (on connect or after control commands).
        if (payload.type === "subathon_state") {
          setTotalSeconds(payload.total_seconds ?? 0);
          setRunning(payload.running ?? false);
          return;
        }
        if (payload.type === "donation_alert" && payload.amount > 0) {
          // Find the best matching rule (largest min_amount <= donation amount)
          const rules: TimeRule[] = settings?.sub_time_rules ?? [];
          const matching = rules
            .filter((r) => payload.amount >= r.min_amount)
            .sort((a, b) => b.min_amount - a.min_amount)[0];

          if (matching) {
            const add =
              matching.hours * 3600 + matching.minutes * 60 + matching.seconds;
            setTotalSeconds((prev) => prev + add);
            showAdded(add);
          }
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => setTimeout(connect, 3000);
  }, [streamKey, settings]);

  React.useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  if (!settings) return null;

  const bg = settings.sub_bg_color || "#faae2b";
  const tc = settings.sub_text_color || "#111111";
  const fw = settings.sub_font_weight || 500;
  const ff =
    settings.sub_font_content === "default"
      ? undefined
      : settings.sub_font_content;
  const noBorder = settings.sub_no_border ?? false;

  return (
    <div
      className={`w-full relative pointer-events-auto select-none rounded-md overflow-hidden ${noBorder ? "" : "border-2 border-black"}`}
      style={{
        backgroundColor: bg,
        boxShadow: noBorder ? undefined : "6px 6px 0px 0px rgba(0,0,0,0.99)",
      }}
    >
      {/* Time-added popup — top-right corner */}
      {addedNotif && (
        <div
          className="absolute top-3 right-3 flex items-center gap-x-2 px-4 py-2 rounded-lg border-2 border-black text-2xl font-bold animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ backgroundColor: tc, color: bg }}
        >
          <span>+</span>
          <span>{addedNotif.slice(1)}</span>
        </div>
      )}

      {/* Timer */}
      <div
        className="text-center py-6 text-7xl font-bold tracking-widest"
        style={{ color: tc, fontFamily: ff || "inherit", fontWeight: fw }}
      >
        {formatTime(totalSeconds)}
      </div>
    </div>
  );
}

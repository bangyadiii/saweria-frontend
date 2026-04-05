"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Env from "@/lib/env";
import { Card, CardContent } from "@/components/ui/card";

type AlertPayload = {
  type: "donation_alert";
  donor_name: string;
  amount: number;
  message: string;
  media_url?: string;
  template_text: string;
  background_color?: string;
  highlight_color?: string;
  text_color?: string;
  notification_duration: number;
  tts_variant?: string;
  sound_url?: string;
};

function formatTemplate(template: string, name: string, amount: number) {
  return template
    .replace(/\[nama\]/g, name)
    .replace(/\[nominal\]/g, `Rp ${amount.toLocaleString("id-ID")}`);
}

export default function WidgetAlertPage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [current, setCurrent] = React.useState<AlertPayload | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [audioUnlocked, setAudioUnlocked] = React.useState(false);
  const queueRef = React.useRef<AlertPayload[]>([]);
  const processingRef = React.useRef(false);
  const wsRef = React.useRef<WebSocket | null>(null);
  const audioUnlockedRef = React.useRef(false);

  const unlockAudio = () => {
    // Resume AudioContext + play a silent buffer to satisfy autoplay policy
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume();
    audioUnlockedRef.current = true;
    setAudioUnlocked(true);
  };

  const processQueue = React.useCallback(() => {
    if (
      pausedRef.current ||
      processingRef.current ||
      queueRef.current.length === 0
    )
      return;
    processingRef.current = true;
    const item = queueRef.current.shift()!;
    setCurrent(item);
    setVisible(true);

    // Register skip callback
    let skipped = false;
    skipRef.current = () => {
      skipped = true;
      setVisible(false);
      setTimeout(() => {
        setCurrent(null);
        processingRef.current = false;
        skipRef.current = null;
        processQueue();
      }, 500);
    };

    // Notification sound
    if (item.sound_url) {
      const url = item.sound_url.startsWith("http")
        ? item.sound_url
        : Env.SERVER_ENDPOINT + item.sound_url;
      const audio = new Audio(url);
      audio.play().catch(() => {});
    }

    // TTS
    if (
      item.tts_variant &&
      item.tts_variant !== "null" &&
      "speechSynthesis" in window
    ) {
      const lang = item.tts_variant === "indonesia" ? "id-ID" : "en-US";
      const text = formatTemplate(
        item.template_text,
        item.donor_name,
        item.amount,
      );
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }

    const duration = (item.notification_duration || 5) * 1000;
    setTimeout(() => {
      if (skipped) return; // already handled by skip
      setVisible(false);
      setTimeout(() => {
        setCurrent(null);
        processingRef.current = false;
        skipRef.current = null;
        processQueue();
      }, 500);
    }, duration);
  }, []);

  const pausedRef = React.useRef(false);
  const skipRef = React.useRef<(() => void) | null>(null);

  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("[alert-widget] WS received:", payload);
        if (payload.type === "control") {
          if (payload.action === "pause") pausedRef.current = true;
          if (payload.action === "play") {
            pausedRef.current = false;
            processQueue();
          }
          if (payload.action === "skip") skipRef.current?.();
          if (payload.action === "refresh") window.location.reload();
          return;
        }
        if (payload.type === "donation_alert") {
          queueRef.current.push(payload);
          processQueue();
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onopen = () => {
      console.log("[alert-widget] WS connected, key:", streamKey);
    };

    ws.onclose = () => {
      console.log("[alert-widget] WS closed, reconnecting...");
      setTimeout(connect, 3000);
    };
  }, [streamKey, processQueue]);

  React.useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  if (!current) return null;

  const bg = current.background_color || "hsl(var(--primary))";
  const hl = current.highlight_color || "hsl(var(--foreground))";
  const tc = current.text_color || "black";

  const parts = (
    current.template_text || "[nama] baru saja memberikan [nominal]"
  ).split(/(\[nama\]|\[nominal\])/);

  return (
    <div
      className="w-full pointer-events-none"
      style={{ background: "transparent" }}
    >
      {/* Audio unlock button — user clicks once in OBS to enable sound */}
      {!audioUnlocked && (
        <button
          className="absolute top-2 left-2 pointer-events-auto rounded px-3 py-1 text-xs opacity-60 hover:opacity-100"
          style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
          onClick={unlockAudio}
        >
          🔊 Klik untuk aktifkan suara
        </button>
      )}
      <Card
        style={{ backgroundColor: bg }}
        className={`font-sans text-center w-full shadow-2xl transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {parts.map((part, i) => {
          if (part === "[nama]") {
            return (
              <span key={i} style={{ color: hl }}>
                {current.donor_name}
              </span>
            );
          }
          if (part === "[nominal]") {
            return (
              <span key={i} style={{ color: hl }}>
                Rp{current.amount.toLocaleString("id-ID")}
              </span>
            );
          }
          return (
            <span key={i} style={{ color: tc }}>
              {part}
            </span>
          );
        })}
        <CardContent className="p-0" style={{ color: tc }}>
          {current.message}
        </CardContent>
      </Card>
    </div>
  );
}

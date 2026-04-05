"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Env from "@/lib/env";

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
};

type QueueItem = AlertPayload;

function formatTemplate(template: string, name: string, amount: number) {
  return template
    .replace(/\[nama\]/g, name)
    .replace(/\[nominal\]/g, `Rp ${amount.toLocaleString("id-ID")}`);
}

export default function ObsAlertPage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [current, setCurrent] = React.useState<QueueItem | null>(null);
  const [visible, setVisible] = React.useState(false);
  const queueRef = React.useRef<QueueItem[]>([]);
  const processingRef = React.useRef(false);
  const wsRef = React.useRef<WebSocket | null>(null);

  const processQueue = React.useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    processingRef.current = true;
    const item = queueRef.current.shift()!;
    setCurrent(item);
    setVisible(true);

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
      setVisible(false);
      setTimeout(() => {
        setCurrent(null);
        processingRef.current = false;
        processQueue();
      }, 500); // fade-out buffer
    }, duration);
  }, []);

  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload: AlertPayload = JSON.parse(event.data);
        if (payload.type === "donation_alert") {
          queueRef.current.push(payload);
          processQueue();
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
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

  const bg = current.background_color || "#1a1a2e";
  const hl = current.highlight_color || "#e94560";
  const tc = current.text_color || "#ffffff";
  const displayText = formatTemplate(
    current.template_text,
    current.donor_name,
    current.amount,
  );

  return (
    <div
      className="fixed inset-0 flex items-end justify-center pointer-events-none"
      style={{ background: "transparent" }}
    >
      <div
        className={`mb-10 px-6 py-4 rounded-xl shadow-2xl max-w-lg w-full transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{
          backgroundColor: bg,
          color: tc,
          borderLeft: `6px solid ${hl}`,
        }}
      >
        <p className="text-lg font-bold" style={{ color: hl }}>
          {current.donor_name}
        </p>
        <p className="text-base">{displayText}</p>
        {current.message && (
          <p className="text-sm mt-1 opacity-80">
            &ldquo;{current.message}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Env from "@/lib/env";

type MediaPayload = {
  type: "donation_alert";
  donor_name: string;
  amount: number;
  message: string;
  media_url: string;
  notification_duration: number;
  ms_background_color?: string;
  ms_highlight_color?: string;
  ms_text_color?: string;
  ms_template_text?: string;
  ms_no_border?: boolean;
  ms_font_weight?: number;
  ms_font_family?: string;
};

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  return null;
}

export default function WidgetMediasharePage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [current, setCurrent] = React.useState<MediaPayload | null>(null);
  const [visible, setVisible] = React.useState(false);
  const queueRef = React.useRef<MediaPayload[]>([]);
  const processingRef = React.useRef(false);
  const wsRef = React.useRef<WebSocket | null>(null);
  const pausedRef = React.useRef(false);
  const skipRef = React.useRef<(() => void) | null>(null);

  const processQueue = React.useCallback(() => {
    if (
      pausedRef.current ||
      processingRef.current ||
      queueRef.current.length === 0
    )
      return;
    const item = queueRef.current[0];
    if (!item.media_url) {
      queueRef.current.shift();
      processQueue();
      return;
    }
    processingRef.current = true;
    setCurrent(item);
    setVisible(true);

    // Register skip callback
    let skipped = false;
    skipRef.current = () => {
      skipped = true;
      setVisible(false);
      setTimeout(() => {
        queueRef.current.shift();
        setCurrent(null);
        processingRef.current = false;
        skipRef.current = null;
        processQueue();
      }, 500);
    };

    const duration = (item.notification_duration || 30) * 1000;
    setTimeout(() => {
      if (skipped) return;
      setVisible(false);
      setTimeout(() => {
        queueRef.current.shift();
        setCurrent(null);
        processingRef.current = false;
        skipRef.current = null;
        processQueue();
      }, 500);
    }, duration);
  }, []);

  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
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
        if (payload.type === "donation_alert" && payload.media_url) {
          queueRef.current.push(payload);
          processQueue();
        }
      } catch {
        // ignore
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

  const bg = current.ms_background_color || "#358ad9";
  const hl = current.ms_highlight_color || "#fcfeff";
  const tc = current.ms_text_color || "#000000";
  const fw = current.ms_font_weight || 500;
  const ff = current.ms_font_family || "Poppins";
  const noBorder = current.ms_no_border ?? false;
  const templateText = current.ms_template_text || "baru saja memberi";
  const embedUrl = getYouTubeEmbedUrl(current.media_url);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "transparent" }}
    >
      <div
        className="w-full max-w-2xl"
        style={{ fontFamily: ff, fontWeight: fw }}
      >
        {/* Video on top */}
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full aspect-video rounded-t-xl"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div
            className="rounded-t-xl p-4 text-center text-sm break-all aspect-video flex items-center justify-center"
            style={{ backgroundColor: bg, color: tc }}
          >
            {current.media_url}
          </div>
        )}

        {/* Info bar below video */}
        <div
          className="px-4 py-3 text-center rounded-b-xl"
          style={{
            backgroundColor: bg,
            borderTop: noBorder ? "none" : `3px solid ${hl}`,
          }}
        >
          <div className="text-base">
            <span style={{ color: hl }}>{current.donor_name} </span>
            <span style={{ color: tc }}>
              {templateText
                .replace(/\[nama\]/g, "")
                .replace(/\[nominal\]/g, "")
                .trim() || "baru saja memberi"}{" "}
            </span>
            <span style={{ color: hl }}>
              Rp{current.amount.toLocaleString("id-ID")}
            </span>
          </div>
          {current.message && (
            <div className="text-sm mt-1" style={{ color: hl }}>
              {current.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

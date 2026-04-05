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
};

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  return null;
}

export default function ObsMediasharePage() {
  const searchParams = useSearchParams();
  const streamKey = searchParams.get("key") ?? "";

  const [current, setCurrent] = React.useState<MediaPayload | null>(null);
  const queueRef = React.useRef<MediaPayload[]>([]);
  const processingRef = React.useRef(false);
  const wsRef = React.useRef<WebSocket | null>(null);

  const processQueue = React.useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    const item = queueRef.current[0];
    if (!item.media_url) {
      queueRef.current.shift();
      processQueue();
      return;
    }
    processingRef.current = true;
    setCurrent(item);

    const duration = (item.notification_duration || 30) * 1000;
    setTimeout(() => {
      queueRef.current.shift();
      setCurrent(null);
      processingRef.current = false;
      processQueue();
    }, duration);
  }, []);

  const connect = React.useCallback(() => {
    if (!streamKey) return;
    const ws = new WebSocket(`${Env.WS_URL}/ws?key=${streamKey}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload: MediaPayload = JSON.parse(event.data);
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

  const embedUrl = getYouTubeEmbedUrl(current.media_url);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "transparent" }}
    >
      <div className="w-full max-w-2xl">
        <div className="bg-black/80 text-white px-4 py-2 rounded-t-xl text-sm">
          <span className="font-bold text-yellow-400">
            {current.donor_name}
          </span>{" "}
          — Rp {current.amount.toLocaleString("id-ID")}
          {current.message && (
            <span className="ml-2 opacity-70">
              &ldquo;{current.message}&rdquo;
            </span>
          )}
        </div>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full aspect-video rounded-b-xl"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="bg-gray-800 text-white rounded-b-xl p-4 text-center">
            {current.media_url}
          </div>
        )}
      </div>
    </div>
  );
}

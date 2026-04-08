"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import {
  MABAR_QUEUE_DONE_ENDPOINT,
  MABAR_QUEUE_ENDPOINT,
  MABAR_QUEUE_REORDER_ENDPOINT,
} from "@/lib/api-endpoints";
import { CheckCheck, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

type MabarQueueItem = {
  id: string;
  donor_name: string;
  ingame_username: string;
  amount: number;
  priority_tier: "gold" | "silver" | "bronze";
  priority_order: number;
  created_at: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const TIER_STYLES: Record<
  MabarQueueItem["priority_tier"],
  { bar: string; badge: string; label: string }
> = {
  gold: {
    bar: "bg-yellow-400",
    badge: "bg-yellow-100 border-yellow-500 text-yellow-900",
    label: "Gold",
  },
  silver: {
    bar: "bg-gray-300",
    badge: "bg-gray-100 border-gray-400 text-gray-700",
    label: "Silver",
  },
  bronze: {
    bar: "bg-amber-700",
    badge: "bg-amber-50 border-amber-600 text-amber-900",
    label: "Bronze",
  },
};

function TierBadge({ tier }: { tier: MabarQueueItem["priority_tier"] }) {
  const s = TIER_STYLES[tier] ?? TIER_STYLES.bronze;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-semibold border ${s.badge}`}
    >
      {s.label}
    </span>
  );
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function MabarQueuePage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<MabarQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await $axios.get(MABAR_QUEUE_ENDPOINT);
      setQueue(res.data?.data ?? []);
    } catch {
      // silently ignore poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    intervalRef.current = setInterval(fetchQueue, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQueue]);

  const markDone = async (id: string) => {
    try {
      await $axios.put(MABAR_QUEUE_DONE_ENDPOINT(id));
      setQueue((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Done", description: "Item telah ditandai selesai." });
    } catch {
      toast({
        title: "Error",
        description: "Gagal menandai selesai.",
        variant: "destructive",
      });
    }
  };

  const move = async (index: number, direction: "up" | "down") => {
    const newQueue = [...queue];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newQueue.length) return;

    // Swap items
    [newQueue[index], newQueue[swapIndex]] = [
      newQueue[swapIndex],
      newQueue[index],
    ];

    // Reassign priority_order sequentially
    const reorderPayload = newQueue.map((item, i) => ({
      id: item.id,
      priority_order: i + 1,
    }));

    setQueue(newQueue.map((item, i) => ({ ...item, priority_order: i + 1 })));

    try {
      await $axios.put(MABAR_QUEUE_REORDER_ENDPOINT, reorderPayload);
    } catch {
      toast({
        title: "Error",
        description: "Gagal menyimpan urutan.",
        variant: "destructive",
      });
      fetchQueue(); // re-sync from server
    }
  };

  const clearAll = async () => {
    if (!confirm("Hapus semua antrian mabar yang sedang menunggu?")) return;
    try {
      await $axios.delete(MABAR_QUEUE_ENDPOINT);
      setQueue([]);
      toast({
        title: "Cleared",
        description: "Semua antrian berhasil dihapus.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus antrian.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-y-6 mt-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-sans">Mabar Queue</h1>
        {queue.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Semua
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 border border-black shadow-normal animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && queue.length === 0 && (
        <Card className="bg-gray-50 p-1">
          <CardContent className="py-12 text-center font-sans">
            <p className="text-gray-500 font-semibold">Antrian mabar kosong.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Antrian akan terisi otomatis saat ada donasi yang memenuhi syarat
              mabar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Queue list */}
      {!loading && queue.length > 0 && (
        <div className="space-y-3">
          {queue.map((item, index) => {
            const tier = TIER_STYLES[item.priority_tier] ?? TIER_STYLES.bronze;
            return (
              <div
                key={item.id}
                className="flex border-[1.5px] border-black shadow-normal bg-white"
              >
                {/* Tier bar */}
                <div className={`w-2 shrink-0 ${tier.bar}`} />

                {/* Rank */}
                <div className="flex items-center justify-center w-12 shrink-0 border-r border-black">
                  <span className="text-xl font-bold font-mono text-gray-400">
                    {index + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 px-4 py-3 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold font-sans">
                      {item.donor_name}
                    </span>
                    <TierBadge tier={item.priority_tier} />
                    <span className="font-mono text-sm text-gray-600">
                      {formatRupiah(item.amount)}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-gray-500 mt-0.5 truncate">
                    In-game:{" "}
                    <span className="font-semibold text-gray-800">
                      {item.ingame_username || (
                        <em className="text-gray-400">—</em>
                      )}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 px-3 shrink-0 border-l border-black">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => move(index, "up")}
                    title="Naik"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={index === queue.length - 1}
                    onClick={() => move(index, "down")}
                    title="Turun"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => markDone(item.id)}
                    title="Done"
                    className="text-green-700 border-green-500 hover:bg-green-50"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="font-mono text-xs text-muted-foreground">
        Antrian diperbarui otomatis setiap 5 detik.
      </p>
    </div>
  );
}

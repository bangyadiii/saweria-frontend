"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import $axios from "@/lib/axios";
import {
  OVERLAY_TEST_ALERT_ENDPOINT,
  OVERLAY_TEST_MEDIASHARE_ENDPOINT,
  OVERLAY_CONTROL_ENDPOINT,
} from "@/lib/api-endpoints";
import { Pause, Play, SkipForward, RefreshCw, Zap } from "lucide-react";

interface ControlPanelProps {
  /** Section title, e.g. "Kontrol Alert" */
  title: string;
  /** Show the Tes button */
  showTest?: boolean;
  /** Override test endpoint (default: test-alert). Pass OVERLAY_TEST_MEDIASHARE_ENDPOINT for mediashare. */
  testEndpoint?: string;
}

export default function ControlPanel({
  title,
  showTest = true,
  testEndpoint = OVERLAY_TEST_ALERT_ENDPOINT,
}: ControlPanelProps) {
  const { toast } = useToast();

  const sendControl = async (action: string) => {
    try {
      await $axios.post(OVERLAY_CONTROL_ENDPOINT, { action });
      toast({ title: `Perintah "${action}" terkirim ke widget` });
    } catch {
      toast({ title: "Gagal mengirim perintah", variant: "destructive" });
    }
  };

  const sendTest = async () => {
    try {
      await $axios.post(testEndpoint);
      toast({ title: "Test terkirim ke widget!" });
    } catch {
      toast({ title: "Gagal kirim test", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-gray-50 p-1">
      <CardHeader className="font-sans text-xl font-semibold">
        <h2>{title}</h2>
      </CardHeader>
      <CardContent className="font-sans">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => sendControl("pause")}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => sendControl("play")}
          >
            <Play className="mr-2 h-4 w-4" />
            Play
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => sendControl("skip")}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip / Next
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => sendControl("refresh")}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {showTest && (
            <Button type="button" onClick={sendTest}>
              <Zap className="mr-2 h-4 w-4" />
              Tes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

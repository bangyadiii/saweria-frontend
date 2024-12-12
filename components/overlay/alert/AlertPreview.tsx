import { CardContent, Card } from "@/components/ui/card";
import React from "react";

export interface PreviewProps {
  backgroundColor: string | null;
  highlightColor: string | null;
  textColor: string | null;
  templateText?: string;
}

export default function AlertPreview({
  templateText = "[nama] baru saja memberikan [nominal]",
  backgroundColor,
  textColor,
  highlightColor,
}: PreviewProps) {
  const name = "Jokowi";
  const nominal = 20000;
  const currency = "Rp";
  const donationText = "Semangat ya kamu!";

  const parts = templateText.split(/(\[nama\]|\[nominal\])/);

  return (
    <Card
      style={{ backgroundColor: backgroundColor || "hsl(var(--primary))" }}
      className="font-sans text-center"
    >
      {parts.map((part, index) => {
        if (part === "[nama]") {
          return (
            <span
              key={index}
              style={{ color: highlightColor || "hsl(var(--foreground))" }}
            >
              {name}
            </span>
          );
        } else if (part === "[nominal]") {
          return (
            <span
              key={index}
              style={{ color: highlightColor || "hsl(var(--foreground))" }}
            >
              {currency + nominal.toLocaleString("id-ID")}
            </span>
          );
        } else {
          return (
            <span key={index} style={{ color: textColor || "black" }}>
              {part}
            </span>
          );
        }
      })}
      <CardContent className="p-0" style={{ color: textColor || "black" }}>
        {donationText}
      </CardContent>
    </Card>
  );
}

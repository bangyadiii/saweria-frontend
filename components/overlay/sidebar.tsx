"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const tabs = [
  { id: "alert", label: "Alert", href: "/alert" },
  { id: "mediashare", label: "MediaShare", href: "/mediashare" },
  { id: "subathon", label: "Subathon", href: "/subathon" },
  { id: "qrcode", label: "QR Code", href: "/qrcode" },
  { id: "milestone", label: "Milestone", href: "/milestone" },
  { id: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
  { id: "mabar", label: "Mabar", href: "/mabar" },
];

function OverlaySidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    href = "/overlay" + href;
    return pathname === href;
  };

  return (
    <>
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/overlay/${tab.href}`}
          className={`bg-cyan-300 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none shadow-${isActive(tab.href) ? "pressed" : "normal"} transition-all border-[1px] border-black font-mono h-10 px-4 py-2`}
        >
          {tab.label}
        </Link>
      ))}
    </>
  );
}

export default OverlaySidebar;

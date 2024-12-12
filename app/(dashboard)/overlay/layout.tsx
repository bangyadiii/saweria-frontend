import OverlaySidebar from "@/components/overlay/sidebar";
import React from "react";

export const tabs = [
  { id: "alert", label: "Alert", href: "/alert" },
  { id: "mediashare", label: "MediaShare", href: "/mediashare" },
];

function OverlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-x-8 mt-10">
      <aside className="w-[200px] flex flex-col gap-3">
        <OverlaySidebar />
      </aside>
      <main className="w-full">{children}</main>
    </div>
  );
}

export default OverlayLayout;

import type { ReactNode } from "react";

// OBS Browser Source: override root body to transparent, no nested html/body
export default function WidgetLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`body { background: transparent !important; margin: 0; padding: 0; }`}</style>
      {children}
    </>
  );
}

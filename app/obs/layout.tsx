import type { ReactNode } from "react";

// OBS Browser Source: no chrome, transparent background
export default function ObsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body style={{ background: "transparent", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

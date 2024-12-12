import Link from "next/link";
import React from "react";

function DashboardFooter() {
  return (
    <footer className="flex justify-between mt-10 font-mono">
      <div>
        <span>Made with ❤️ from SUB</span>
        <br />
        <span>PT APA ADA AJA</span>
      </div>
      <div>
        <Link href="/privacy" className="underline">Syarat dan Ketentuan</Link>
        <br />
        <Link href="/privacy" className="underline">FAQ</Link>
      </div>
    </footer>
  );
}

export default DashboardFooter;

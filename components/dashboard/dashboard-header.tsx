import Image from "next/image";
import Link from "next/link";
import React from "react";
import Profile from "../profile";

function DashboardHeader() {
  return (
    <header className="flex justify-between items-baseline">
      <Link href="/dashboard">
        <div className="flex justify-center items-baseline p-2 font-sans">
          <Image
            src="/images/download.png"
            alt="Illustration 1"
            width={150}
            height={100}
            className="hidden md:block"
          />
          <span className="font-thin text-3xl">saweria.co</span>
        </div>
      </Link>
      <Profile />
    </header>
  );
}

export default DashboardHeader;

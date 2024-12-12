import Image from "next/image";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
}

function Logo({ width = 300, height = 200 }: Readonly<LogoProps>) {
  return (
    <div className="w-[300px] flex flex-col justify-center items-center p-2 font-sans">
      <Image
        src="/images/download.png"
        alt="Illustration 1"
        width={width}
        height={height}
      />
      <span className="font-thin text-5xl">saweria.co</span>
    </div>
  );
}

export default Logo;

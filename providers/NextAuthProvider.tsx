"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

function NextAuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
        {children}
    </SessionProvider>
  );
}

export default NextAuthProvider;

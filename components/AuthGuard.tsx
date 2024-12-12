"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const guestRoutes: string[] = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const isGuestRoute = !!guestRoutes.find((route) => route === pathname);
    setLoading(true);

    if (status === "loading") {
      return;
    } else if (status === "authenticated" && isGuestRoute) {
      router.push("/admin");
    } else if (status === "unauthenticated" && !isGuestRoute) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [pathname, router, status]);

  return loading ? <div>Loading...</div> : children;
}

"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import $axios from "@/lib/axios";
import { ME_ENDPOINT } from "@/lib/api-endpoints";

type UserProfile = {
  username: string;
  display_name?: string;
  profile_image?: string;
};

function Profile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      $axios
        .get<{ data: UserProfile }>(ME_ENDPOINT)
        .then((res) => setProfile(res.data.data))
        .catch(() => null);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="w-[100px] h-[60px] flex justify-between items-center border-black">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-20 h-5" />
      </div>
    );
  }

  const profileImage = profile?.profile_image ?? undefined;
  const username = profile?.username ?? session?.user?.username ?? "User";
  const displayName = profile?.display_name ?? username;
  const fallback = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="shadow-normal transition-all active:shadow-pressed border-[1px] border-black font-mono p-3 rounded-md flex items-center gap-3">
          <Avatar>
            <AvatarImage src={profileImage} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          {displayName}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="font-mono">
        <DropdownMenuItem>
          <Link href="/profile" className="w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button onClick={() => signOut()}>Logout</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Profile;

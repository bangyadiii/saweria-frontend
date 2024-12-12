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

function Profile() {
  const { data, status } = useSession();
  if (status === "loading") {
    return (
      <div className="w-[100px] h-[60px] flex justify-between items-center border-black">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-20 h-5" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="shadow-normal transition-all active:shadow-pressed border-[1px] border-black font-mono p-3 rounded-md flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://avatars.githubusercontent.com/u/124599?v=4" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {data?.user?.username || "Username here"}
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

"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import Popover from "@/components/shared/popover";
import Image from "next/image";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function UserDropdown({ user }: { user: User }) {
  const [openPopover, setOpenPopover] = useState(false);
  const router = useRouter();

  const email = user.email;
  const metadata = (user.user_metadata ?? {}) as {
    avatar_url?: string;
  };
  const avatarUrl = metadata.avatar_url;

  if (!email) {
    return null;
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setOpenPopover(false);
    router.refresh();
  };

  return (
    <div className="inline-flex text-left space-x-5">
      <Link href="/pricing">
        <button
          className="text-space border border-red-700 p-1.5 px-4 text-sm text-white bg-red-500 transition-all hover:bg-red-700 hover:text-white"
          onClick={() => null}
        >
          Upgrade
        </button>
      </Link>
      <Popover
        content={
          <div className="w-full rounded-md bg-white p-2 sm:w-56">
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <p className="text-sm">Logout</p>
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-9 sm:w-9"
        >
          <Image
            alt={email}
            src={avatarUrl || `https://avatars.dicebear.com/api/micah/${email}.svg`}
            width={40}
            height={40}
          />
        </button>
      </Popover>
    </div>
  );
}

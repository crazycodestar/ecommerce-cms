"use client"

import { UserButton, useUser } from "@clerk/clerk-react";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";

export function TopNav() {
    const myStore = useQuery(api.stores.getMyStore);
    const user = useUser();

    return (
        <nav className="w-full border-b flex items-center justify-between px-6 h-12">
            {/* Left: Logo and Store Info */}
            <div className="flex items-center gap-6 min-w-0">
                <Link href="/">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} className="mr-2" />
                </Link>
                <div className="flex items-center gap-2 min-w-0 text-sm">
                    <span className="font-semibold truncate flex items-center gap-2">
                        Personal Account
                    </span><span className="text-muted-foreground">/</span>
                    <span>{myStore?.name}</span>

                </div>
            </div>

            {/* Center: (Optional) Navigation Tabs or Breadcrumbs */}
            {/* <div className="flex-1 flex justify-center"> ... </div> */}

            {/* Right: User Info and Profile Dropdown */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground hidden md:block">
                    {user.user?.fullName}
                </span>


                <UserButton />

            </div>
        </nav>
    );
} 
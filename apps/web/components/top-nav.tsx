"use client"

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function TopNav() {
    const myStore = useQuery(api.stores.getMyStore);
    const user = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <nav className="w-full border-b flex items-center justify-between px-6 h-12">
            {/* Left: Logo and Store Info */}
            <div className="flex items-center gap-6 min-w-0">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} className="mr-2" />
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
                <div className="relative">

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>

                            <button
                                className="flex items-center gap-2 focus:outline-none"
                                onClick={() => setDropdownOpen((v) => !v)}
                                aria-label="Open user menu"
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.user?.imageUrl} />
                                    <AvatarFallback>{user.user?.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuLabel className="truncate">
                                {user.user?.emailAddresses[0].emailAddress}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="w-4 h-4 mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
} 
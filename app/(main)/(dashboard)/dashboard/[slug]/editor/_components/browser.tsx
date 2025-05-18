"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Maximize2,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

export function Browser({ children }: React.PropsWithChildren) {
  const url = "https://example.com/landing-page";

  return (
    <div className="w-full flex-1 flex flex-col shadow bg-gray-200 rounded-sm">
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex items-center">
            <div className="relative flex-1">
              <Input value={url} readOnly className="h-8 pl-3 pr-8" />
              {url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-8 w-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-h-full p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

// {/* Browser Header */}
// <div className="flex items-center bg-gray-200 px-4 py-2 rounded-t-md relative">
//   <div className="absolute flex items-center left-4 top-1/2 transform -translate-y-1/2">
//     <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
//     <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
//     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//   </div>
//   <div className="absolute flex items-center right-4 top-1/2 transform -translate-y-1/2">
//     <Button
//       variant="link"
//       className="flex gap-1 items-center text-sm"
//       asChild
//     >
//       <Link href={customUrl} target="_blank">
//         Live Site <ArrowRight className="size-3" />
//       </Link>
//     </Button>
//   </div>
//   <div className="flex-1 text-center text-sm font-medium text-gray-50">
//     <div className="flex gap-1 py-0.5 items-center justify-center border border-muted-foreground/30 rounded-sm text-muted-foreground w-1/2 mx-auto">
//       <Lock className="size-3" />
//       {slug}.com
//     </div>
//   </div>
// </div>

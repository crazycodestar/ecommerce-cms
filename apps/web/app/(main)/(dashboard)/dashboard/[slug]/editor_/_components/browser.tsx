"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Copy,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function Browser({ storeSlug }: { storeSlug: string }) {
  const url = process.env.NODE_ENV === "development" ? `http://${storeSlug}.localhost:3000` : `https://${storeSlug}.convertlykit.store`;

  return (
    <div className="sticky top-0 z-10 bg-background flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800">
      <SidebarTrigger />
      <div className="flex-1 flex items-center">
        <div className="relative flex-1">
          <Input value={url} readOnly className="h-8 pl-3 pr-8" />
          {url && (
            <div className="absolute right-0 top-0 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild>
                <Link href={url} target="_blank">
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

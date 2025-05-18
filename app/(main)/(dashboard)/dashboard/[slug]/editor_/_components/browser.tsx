"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Maximize2,
  RefreshCw
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

export function Browser({ children }: React.PropsWithChildren) {
  const url = "https://convertly.convertlykit.app";

  return (
    <div className="w-full h-full flex-1 flex flex-col shadow rounded-sm">
      <div className="z-10 bg-background flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">{children}</div>
    </div>
  );
}

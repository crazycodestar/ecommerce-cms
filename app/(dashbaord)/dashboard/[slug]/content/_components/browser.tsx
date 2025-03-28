"use client";

import { Lock } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

export function Browser({ children }: React.PropsWithChildren) {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="w-full min-h-svh flex flex-col shadow">
      {/* Browser Header */}
      <div className="flex items-center bg-gray-200 px-4 py-2 rounded-t-md">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div className="flex-1 text-center text-sm font-medium text-gray-50">
          <div className="flex gap-1 py-0.5 items-center justify-center border border-muted-foreground/30 rounded-sm text-muted-foreground w-2/3 mx-auto">
            <Lock className="size-3" />
            {slug}.com
          </div>
        </div>
      </div>
      {/* Browser Content */}
      <div className="flex-1 bg-background py-4">{children}</div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

export function Browser({ children }: React.PropsWithChildren) {
  const { slug } = useParams<{ slug: string }>();

  const domain = (process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL)!;

  const urlScheme =
    process.env.NODE_ENV === "production" ? "https://" : "http://";
  const customUrl = `${urlScheme}${slug}.${domain}`;

  return (
    <div className="w-full flex-1 flex flex-col shadow bg-gray-200 rounded-sm">
      {/* Browser Header */}
      <div className="flex items-center bg-gray-200 px-4 py-2 rounded-t-md relative">
        <div className="absolute flex items-center left-4 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="absolute flex items-center right-4 top-1/2 transform -translate-y-1/2">
          <Button
            variant="link"
            className="flex gap-1 items-center text-sm"
            asChild
          >
            <Link href={customUrl} target="_blank">
              Live Site <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
        <div className="flex-1 text-center text-sm font-medium text-gray-50">
          <div className="flex gap-1 py-0.5 items-center justify-center border border-muted-foreground/30 rounded-sm text-muted-foreground w-1/2 mx-auto">
            <Lock className="size-3" />
            {slug}.com
          </div>
        </div>
      </div>
      {/* Browser Content */}
      <div className="flex-1 bg-background py-4 rounded-sm mx-1 mb-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";

import { siteConfig } from "@/app/config/site";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Intro() {
  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.set("step", "create");
  const navigateTo = `/onboarding?${newSearchParams.toString()}`;

  return (
    <AnimatedGroup
      preset="blur-slide"
      className="mx-5 flex flex-col items-center space-y-2.5 text-center sm:mx-auto"
    >
      <h1 className="text-balance text-4xl font-bold transition-colors sm:text-5xl">
        Welcome to{" "}
        <span className="animate-text-gradient bg-gradient-to-r from-purple-500 via-red-500 to-orange-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent">
          {siteConfig.name}
        </span>
      </h1>
      <p className="max-w-md text-muted-foreground transition-colors sm:text-lg">
        Get started with your new store in just a few steps and start selling
        your products online.
      </p>
      <div className="pt-2">
        <Button asChild>
          <Link href={navigateTo}>Get started</Link>
        </Button>
      </div>
    </AnimatedGroup>
  );
}

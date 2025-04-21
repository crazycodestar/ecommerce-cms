"use client";

import { AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";

import { CreateStore } from "./_components/create-store";
import { Intro } from "./_components/intro";

export default function OnboardingPage() {
  const search = useSearchParams();
  const step = search.get("step");

  return (
    <AnimatePresence mode="wait">
      {!step && <Intro key="intro" />}
      {step === "create" && <CreateStore />}
    </AnimatePresence>
  );
}

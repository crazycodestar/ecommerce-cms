"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface MenuNavProps<T extends string> {
  tabs: {
    label: string;
    route: T;
  }[];
  active: T;
  onClick: (route: T) => void;
}

export function MenuNav<T extends string>({
  tabs,
  onClick,
  active,
}: MenuNavProps<T>) {
  //   const [selectedTab, setSelectedTab] = useState("Overview");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  return (
    <nav>
      <ul className="flex" onMouseLeave={() => setHoveredTab(null)}>
        {tabs.map(({ label, route }, index) => (
          <li key={index} className="relative">
            <button
              className={cn(
                "relative z-10 px-3 py-2 text-muted-foreground",
                label === hoveredTab ? " text-foreground" : "",
                route === active ? " text-foreground" : ""
              )}
              onClick={() => onClick(route)}
              onMouseEnter={() => setHoveredTab(label)}
            >
              {label}
            </button>
            {label === hoveredTab ? (
              <motion.div
                layoutId="background"
                className="w-full h-8 bg-gray-100 absolute top-1 left-0 rounded-md"
              />
            ) : null}
            {route === active ? (
              <motion.div
                className="w-full border-b-2 border-foreground"
                layoutId="underline"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

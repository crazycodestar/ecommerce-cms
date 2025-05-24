import React from "react";
import { ConvexClientProvider } from "../ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider ><ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >{children}</ThemeProvider></ConvexClientProvider>;
}

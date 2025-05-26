import React from "react";
import { ConvexClientProvider } from "../ConvexClientProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <ConvexClientProvider>{children}</ConvexClientProvider>;

  // return <ConvexClientProvider><ThemeProvider
  //   attribute="class"
  //   defaultTheme="system"
  //   enableSystem
  //   disableTransitionOnChange
  // >{children}</ThemeProvider></ConvexClientProvider>;
}

import React from "react";
import { ConvexClientProvider } from "../ConvexClientProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}

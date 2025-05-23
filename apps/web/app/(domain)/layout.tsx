import React from "react";
import { ConvexClientProviderWithoutAuth } from "../ConvexClientProvider";

export default function DomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ConvexClientProviderWithoutAuth>
      {children}
    </ConvexClientProviderWithoutAuth>
  );
}

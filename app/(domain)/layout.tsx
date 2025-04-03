import React from "react";
import { ConvexClientProviderWithoutAuth } from "../ConvexClientProvider";
import { Nav } from "./_components/nav";
import { Footer } from "./_components/footer";

export default function DomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProviderWithoutAuth>
      <Nav />
      {children}
      <Footer />
    </ConvexClientProviderWithoutAuth>
  );
}

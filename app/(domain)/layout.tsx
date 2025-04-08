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
      <div className="flex flex-col min-h-svh">
        <Nav />
        {children}
        <Footer />
      </div>
    </ConvexClientProviderWithoutAuth>
  );
}

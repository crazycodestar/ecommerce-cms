import type { Metadata } from "next";
import React from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { Footer } from "../_components/footer";
import { Nav } from "../_components/nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const store = await fetchQuery(api.stores.getStoreBySlugPublic, {
    storeSlug: domain,
  });
  const imageUrl = store?.logoId
    ? await fetchQuery(api.contents.getImageUrl, {
        imageId: store.logoId,
      })
    : null;

  return {
    title: store?.name,
    description: store?.description,
    icons: {
      icon: imageUrl ?? "/logo.svg",
    },
  };
}

export default async function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain: storeSlug } = await params;
  return (
    <div className="flex flex-col min-h-svh">
      <Nav storeSlug={storeSlug} />
      {children}
      <Footer />
    </div>
  );
}

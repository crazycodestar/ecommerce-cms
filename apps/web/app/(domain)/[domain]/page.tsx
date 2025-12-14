import { api } from "@packages/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: storeSlug } = await params;

  const content = await fetchQuery(api.contents.getContentByStoreSlug, {
    storeSlug,
  });

  if (!storeSlug) return notFound();

  return <div>Hello</div>;
}

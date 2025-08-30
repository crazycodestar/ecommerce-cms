import { api } from "@packages/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { ContentConsumer } from "@/components/editor/content-consumer";
import { Content } from "@/hooks/use-editor";

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: storeSlug } = await params;

  const content = await fetchQuery(api.contents.getContentByStoreSlug, {
    storeSlug,
  });
  const parsedContent = content ? (JSON.parse(content) as Content[]) : [];

  if (!storeSlug) return notFound();

  return <ContentConsumer content={parsedContent} slug={storeSlug} />;
}

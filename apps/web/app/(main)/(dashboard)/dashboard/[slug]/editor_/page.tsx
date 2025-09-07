"use client";

import { ContentConsumer } from "@/components/editor/content-consumer";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { Navbar } from "@/components/editor/nav-bar";
import { PropertiesSidebar } from "@/components/editor/properties-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Content, useEditor, useSync } from "@/hooks/use-editor";
import { useView } from "@/hooks/use-view";
import { tryCatch } from "@/lib/try-catch";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { View } from "./view";
import { useTailwindCSS } from "@/hooks/use-editor/properties";

export default function ContentPage() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setShouldRender(true);
    setIsInIframe(window.self !== window.top);
  }, []);

  if (!shouldRender) return null;
  return isInIframe ? <View /> : <PageContent />;
}

const PageContent = () => {
  useSync();

  const boundaryRef = useRef<HTMLDivElement>(null);
  const { view, setView, width, setWidth } = useView({ boundaryRef });
  const { slug } = useParams<{ slug: string }>();
  const contentInit = useQuery(api.contents.getContent);
  const isPending = contentInit === undefined;

  const setContent = useEditor((state) => state.setContent);
  const content = useEditor((state) => state.content);

  useEffect(() => {
    if (isPending) return;

    if (!contentInit) return;

    const parsedContent = JSON.parse(contentInit) as Content[];
    setContent(parsedContent);
  }, [isPending, contentInit, setContent]);

  // submit content
  const updateContent = useMutation(api.contents.updateContent);
  const [isPendingForm, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams.get("from") === "onboarding";

  async function onSubmit() {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateContent({
          content: JSON.stringify(content),
        })
      );
      if (error) {
        console.error(error);
        toast.error("Failed to update content");
        return;
      }

      toast.success("Content updated successfully");

      console.log(isFromOnboarding);
      if (isFromOnboarding) {
        return router.push(`/dashboard/${slug}/products/add-product`);
      }

      return router.push(`/dashboard/${slug}/`);
    });
  }

  const url =
    process.env.NODE_ENV === "development"
      ? `http://${slug}.localhost:3000`
      : `https://${slug}.convertlykit.store`;

  return (
    <SidebarProvider
      style={{
        // @ts-expect-error sidebar config
        "--sidebar-width": "15rem",
      }}
    >
      <EditorSidebar />
      <SidebarInset className="bg-neutral-100">
        <Navbar
          onPublish={onSubmit}
          isPending={isPendingForm}
          url={url}
          view={view}
          setView={setView}
        />
        {isPending ? (
          <ContentPageLoading />
        ) : (
          <ContentConsumer
            content={content}
            slug={slug}
            view={view}
            width={width}
            setWidth={setWidth}
            ref={boundaryRef}
          />
        )}
      </SidebarInset>
      <PropertiesSidebar side="right" />
    </SidebarProvider>
  );
};

const ContentPageLoading = () => {
  return (
    <div className="min-h-[calc(100vh-48px)]">
      <div className="flex flex-col items-center justify-center min-h-full gap-4">
        <Loader2 className="size-10 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    </div>
  );
};

const EditorLoading = () => {
  return (
    <div className="min-h-[calc(100vh-48px)]">
      <div className="flex flex-col items-center justify-center min-h-full gap-4">
        <Loader2 className="size-10 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  );
};

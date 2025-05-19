"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { Browser } from "./_components/browser";
import {
  ContentForm,
  ContentFormValues,
  useContentForm,
} from "./_components/content-form";
import { ContentPreview } from "./_components/content-preview";
import { DeploymentLoading } from "./_components/deployment-loading";
import { EditorSidebar } from "./_components/editor-sidebar";

const deploymentStages = [
  "Setting up project",
  "Spinning up server",
  "Deploying project",
];

export default function ContentPage() {
  const contentJson = useQuery(api.contents.getContentJson);
  const isPending = contentJson === undefined;
  const {
    form,
    onSubmit,
    isPending: isPendingForm,
    isGeneratingSite,
  } = useContentForm(contentJson ?? undefined);

  return (
    <SidebarProvider
      style={{
        // @ts-expect-error sidebar config
        "--sidebar-width": "25rem",
      }}
    >
      <EditorSidebar variant="inset">
        <ContentForm
          form={form}
          onSubmit={onSubmit}
          isPending={isPendingForm}
        />
      </EditorSidebar>
      {isGeneratingSite !== null && (
        <DeploymentLoading isSuccess={!isGeneratingSite} />
      )}
      <SidebarInset className="z-10">
        <Browser>
          {isPending ? (
            <ContentPageLoading />
          ) : (
            <ContentPreview formValues={form.watch() as ContentFormValues} />
            // <iframe
            //   id="inlineFrameExample"
            //   title="Inline Frame Example"
            //   className="w-full min-h-full"
            //   src="http://localhost:5173"
            // ></iframe>
          )}
        </Browser>
      </SidebarInset>
    </SidebarProvider>
  );
}

const ContentPageLoading = () => {
  const [currentStage, setCurrentStage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % deploymentStages.length);
    }, 3000); // Change stage every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex space-x-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
          <div className="mt-2 flex space-x-6 overflow-x-auto py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative">
        <Skeleton className="h-[400px] w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Skeleton className="mb-4 h-10 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      {/* Product Carousel */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-3" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      {/* Featured Section */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Second Product Carousel */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-3" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Currently Loving */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>

      {/* Shop By Category */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Looks Curated For You */}
      <div className="container mx-auto mt-8 px-4">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="aspect-[3/2] w-full" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-32" />
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-24" />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      </footer>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Deploying your project
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
            <p className="text-lg">{deploymentStages[currentStage]}</p>
          </div>
          <p className="text-sm text-gray-500">This may take a few minutes.</p>
        </div>
      </div>
    </div>
  );
};

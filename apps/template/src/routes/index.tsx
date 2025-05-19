import { contentsAPI } from "@/api";
import { type ContentSchema } from "@/api/returnTypes";
import { EditorLoading } from "@/components/editor/editor-loading";
import { useStoreSlug } from "@/hooks/use-store-slug";
import { formatCurrency } from "@/lib/utils";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import React from "react";
import { z } from "zod";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { storeSlug } = useStoreSlug();
  const [contents, setContents] = React.useState<ContentSchema[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchContents = async () => {
      if (!storeSlug) return;

      try {
        const data = await contentsAPI.getContentsByStoreSlug(storeSlug);
        setContents(data);
      } catch (error) {
        console.error("Failed to fetch contents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, [storeSlug]);

  if (!storeSlug) return <EditorLoading />;

  if (isLoading) return <EditorLoading />;
  if (contents === null) return { notFound: true };

  return (
    <>
      <HeroSection />

      <section className="container mx-auto px-4 md:px-8 py-16 flex flex-col gap-8">
        <h2 className="text-lg font-light uppercase tracking-wide text-center">
          My Products
        </h2>

        <MyProducts />
      </section>
    </>
  );
}

const contentFormSchema = z.object({
  hero: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    imageId: z.string().min(1, { message: "Image is required" }),
  }),
});

function HeroSection() {
  const store = useQuery(api.stores.getStoreBySlugPublic, {
    storeSlug: import.meta.env.VITE_STORE_SLUG,
  });

  const content = useQuery(api.contents.getContentJsonByStoreSlug, {
    storeSlug: import.meta.env.VITE_STORE_SLUG,
  });
  const parsedContent = content ? contentFormSchema.parse(JSON.parse(content)) : null;
  const imageUrl = useQuery(api.contents.getImageUrl, parsedContent?.hero.imageId ? {
    imageId: parsedContent?.hero.imageId as Id<"_storage">,
  } : "skip");

  if (content === undefined) return null;
  return (
    <div className="relative h-[70vh] w-full">
      <img
        src={imageUrl ?? "/placeholder.svg?height=700&width=1200&text=Zella+Leggings"}
        alt="Hero"
        className="w-full h-full object-cover -z-10 absolute top-0 left-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
      <div className="relative z-10 w-full h-full flex flex-col gap-2 justify-center items-center">
        <p className="text-white font-extralight text-sm uppercase tracking-wide">
          {store?.name}
        </p>
        <h1 className="text-white text-4xl font-light uppercase tracking-wide">
          {parsedContent?.hero.title}
        </h1>
        <p className="text-white text-sm font-extralight">
          {parsedContent?.hero.description}
        </p>
      </div>
    </div>
  );
}


const MyProducts = () => {
  const { storeSlug } = useStoreSlug();
  const products = useQuery(api.products.getProductsByStoreSlug, {
    slug: storeSlug,
  });


  if (products === undefined) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products?.map((product) => product && (
        <Link
          key={product._id}
          to={`/prd/$slug`}
          params={{ slug: product._id }}
          className="flex flex-col gap-2"
        >
          <div className="relative w-full h-full overflow-hidden group">
            {product.imageUrls[0] && <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover transition-transform duration-250 group-hover:scale-105"
            />}
            {product.imageUrls[1] && (
              <img
                src={product.imageUrls[1]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-250 group-hover:opacity-100"
              />
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center opacity-0 transition-opacity duration-250 group-hover:opacity-100">
              <button className="bg-white/90 text-black px-6 py-2 w-full text-sm font-medium hover:bg-white transition-colors">
                Quick View
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-light uppercase tracking-wider">
              {product.name}
            </p>
            <p className="font-extralight text-sm">
              {formatCurrency(product.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

import { formatCurrency } from "@/lib/utils";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { z } from "zod";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ContentConsumer } from "@/components/editor/content-consumer";
import { Content } from "@/hooks/use-editor";

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: storeSlug } = await params;
  const content = await fetchQuery(api.contents.getContentByStoreSlug, {
    storeSlug,
  });
  const parsedContent = content ? JSON.parse(content) as Content[] : [];
  const products = await fetchQuery(api.products.getProductsByStoreSlug, {
    slug: storeSlug,
  });

  if (!storeSlug) return notFound();

  return <ContentConsumer content={parsedContent} />

  // return (
  //   <>
  //     <HeroSection contents={contents} storeSlug={storeSlug} />

  //     <section className="container mx-auto px-4 md:px-8 py-16 flex flex-col gap-8">
  //       <h2 className="text-lg font-light uppercase tracking-wide text-center">
  //         My Products
  //       </h2>

  //       <MyProducts products={products} />
  //     </section>
  //   </>
  // );
}

const contentFormSchema = z.object({
  hero: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    imageId: z.string().min(1, { message: "Image is required" }),
  }),
});

async function HeroSection({ contents, storeSlug }: { contents: string | null, storeSlug: string }) {
  const parsedContent = contents ? contentFormSchema.parse(JSON.parse(contents)) : null;

  const imageUrl = await fetchQuery(api.contents.getImageUrl, {
    imageId: parsedContent?.hero.imageId as Id<"_storage">,
  });

  return (
    <div className="relative h-[70vh] w-full">
      <Image
        fill
        src={imageUrl ?? "/placeholder.svg?height=700&width=1200&text=Zella+Leggings"}
        alt="Hero"
        className="w-full h-full object-cover -z-10 absolute top-0 left-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
      <div className="relative z-10 w-full h-full flex flex-col gap-2 justify-center items-center">
        <p className="text-white font-extralight text-sm uppercase tracking-wide">
          {storeSlug}
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

type Product = Awaited<ReturnType<typeof fetchQuery<typeof api.products.getProductsByStoreSlug>>>[number];

const MyProducts = ({ products }: { products: Product[] | null }) => {
  if (products === undefined) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {products?.map((product) => product && (
        <Link
          key={product._id}
          href={`/prd/${product._id}`}
          className="flex flex-col gap-2"
        >
          <div className="relative w-full h-full overflow-hidden group">
            {product.imageUrls[0] && <Image
              src={product.imageUrls[0] ?? `/placeholder.svg?height=300&width=400&text=${product.name}`}
              alt={product.name}
              width={300}
              height={400}
              className="w-full aspect-[3/4] object-cover transition-transform duration-250 group-hover:scale-105"
            />}
            {product.imageUrls[1] && (
              <Image
                src={product.imageUrls[1] ?? `/placeholder.svg?height=300&width=400&text=${product.name}`}
                alt={product.name}
                width={300}
                height={400}
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

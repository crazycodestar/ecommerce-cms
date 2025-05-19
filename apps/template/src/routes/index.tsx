import { contentsAPI } from "@/api";
import { type ContentSchema } from "@/api/returnTypes";
import { EditorLoading } from "@/components/editor/editor-loading";
import { api } from "@packages/backend/convex/_generated/api";
import { useStoreSlug } from "@/hooks/use-store-slug";
import { cn, formatCurrency } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import React from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const collections = [
  {
    id: 1,
    imageUrl: "/collection-image-1.webp",
    title: "mechanical",
    slug: "mechanical",
  },
  {
    id: 2,
    imageUrl: "/collection-image-2.webp",
    title: "automatic",
    slug: "automatic",
  },
  {
    id: 3,
    imageUrl: "/collection-image-3.webp",
    title: "custom engrave",
    slug: "custom-engrave",
  },
  {
    id: 4,
    imageUrl: "/collection-image-4.webp",
    title: "custom song",
    slug: "custom-song",
  },
];

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
      <section className="container mx-auto px-4 md:px-8 py-16 flex flex-col gap-8">
        <h2 className="text-lg font-light uppercase tracking-wide text-center">
          Collection List
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((content) => (
            <CollectionListItem
              key={content.id}
              imageUrl={content.imageUrl}
              title={content.title}
              collectionSlug={content.slug}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function HeroSection() {
  return (
    <div className="relative h-screen w-full">
      <img
        src="/hero-image.webp"
        alt="Hero"
        className="w-full h-full object-cover -z-10 absolute top-0 left-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
      <div className="relative z-10 w-full h-full flex flex-col gap-2 justify-center items-center">
        <p className="text-white font-extralight text-sm uppercase tracking-wide">
          Musicbox.ng
        </p>
        <h1 className="text-white text-4xl font-light uppercase tracking-wide">
          The authenticity of memory
        </h1>
        <p className="text-white text-sm font-extralight">
          Happiness happens only when it is shared
        </p>
      </div>
    </div>
  );
}

const CollectionListItem = ({
  imageUrl,
  title,
  collectionSlug,
  className,
}: {
  imageUrl: string;
  title: string;
  collectionSlug: string;
  className?: string;
}) => {
  return (
    <Link to={`/$collection`} params={{ collection: collectionSlug }}>
      <div
        className={cn(
          "relative w-full h-full overflow-hidden group",
          className
        )}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 w-full h-full flex flex-col justify-end p-4 bg-black/30 transition-colors duration-250 group-hover:bg-black/35">
          <p className="text-white text-sm font-extralight uppercase tracking-wider">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
};

const MyProducts = () => {
  const { storeSlug } = useStoreSlug();
  const products = useQuery(api.products.getProductsByStoreSlug, {
    slug: storeSlug,
  });

  if (products === undefined) return <p>loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products?.map(
        (product) =>
          product && (
            <Link
              key={product._id}
              to={`/prd/$slug`}
              params={{ slug: product._id }}
              className="flex flex-col gap-2"
            >
              <div className="relative w-full h-full overflow-hidden group">
                <img
                  src={product.imageUrls[0]!}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
                />
                {product.imageUrls[1] && (
                  <img
                    src={product.imageUrls[1]!}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                  />
                )}
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
          )
      )}
    </div>
  );
};

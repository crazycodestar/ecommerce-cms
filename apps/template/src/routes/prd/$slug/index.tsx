import { productsAPI } from "@/api";
import OrderLayout from "@/components/prd/order-layout";
import { TipTapContent } from "@/components/tiptap";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/prd/$slug/")({
  loader: async ({ params: { slug } }) => {
    const product = await productsAPI.getProductById(slug);
    return { product };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { product } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-white">
      <div className="md:mx-4 px-4 py-4">
        {/* Product Detail Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product?.imageUrls.map((image: string, index: number) => (
                <div key={index} className="aspect-[3/4] bg-gray-100 relative">
                  <img
                    src={
                      image ??
                      "/placeholder.svg?height=600&width=450&text=Front"
                    }
                    alt={`${product!.name}: Image ${index + 1}`}
                    className="object-cover size-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-28">
              <div>
                {/* <h1 className="text-sm text-gray-500 mb-1">KOMAROV</h1> */}
                <h2 className="text-xl font-normal">{product!.name}</h2>
              </div>
              <OrderLayout
                product={{
                  _id: product!._id,
                  price: product!.price,
                  unit: product!.unit ?? "unit",
                  variants: product!.variants ?? [],
                  metadatas:
                    product!.metadatas?.map((m) => ({
                      name: m.metadata!.name,
                      type: m.metadata!.type,
                    })) ?? [],
                }}
              />
              <div className="mb-6">
                {product!.additionalInformation && (
                  <TipTapContent
                    content={product!.additionalInformation ?? ""}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-64" />
      </div>
    </div>
  );
}

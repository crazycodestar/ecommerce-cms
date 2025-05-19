import { createFileRoute } from "@tanstack/react-router";
import { OrderLookup } from "@/components/order/order-lookup";

export const Route = createFileRoute("/order/")({
  validateSearch: (search) => {
    return {
      slug: search.slug,
      reference: search.reference,
    } as {
      slug?: string;
      reference?: string;
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { slug, reference } = Route.useSearch();
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-normal text-center mb-8">
          Order Tracking
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Enter your order ID below to track your order and view details
        </p>
        <OrderLookup slug={slug} reference={reference} />
      </div>
    </main>
  );
}

import { OrderLookup } from "./_components/order-lookup";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Order Tracking</h1>
        <p className="text-center text-muted-foreground mb-8">
          Enter your order ID below to track your order and view details
        </p>
        <OrderLookup />
      </div>
    </main>
  );
}

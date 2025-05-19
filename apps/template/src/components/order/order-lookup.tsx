"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@tanstack/react-router";
import { OrderDetails } from "./order-details";
import { OrderSkeleton } from "./order-skeleton";
import { ordersAPI } from "@/api";
import { useEffect, useState } from "react";
import type { GetOrderByReferenceOrSlugResponse } from "@/api/returnTypes";

export function OrderLookup({
  slug,
  reference,
}: {
  slug?: string;
  reference?: string;
}) {
  const router = useRouter();

  const [order, setOrder] = useState<GetOrderByReferenceOrSlugResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("slug -> ", slug);
    const fetchOrder = async () => {
      if (!reference && !slug) return;

      setIsLoading(true);
      try {
        const data = await ordersAPI.getOrderByReferenceOrSlug(
          reference || undefined,
          slug || undefined
        );
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [reference, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (e.target as HTMLFormElement).slug.value as string;
    router.navigate({ to: "/order", search: { slug } });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              placeholder="Enter your order ID (e.g., ORD-12345)"
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </div>
        </div>
      </form>

      {!isLoading && order === null && (
        <div className="bg-destructive/10 text-destructive p-4 ">
          Order not found. Please ensure you entered in the order number
          correctly.
        </div>
      )}

      {isLoading ? (
        <OrderSkeleton />
      ) : (
        order && (
          <OrderDetails
            order={{
              amount: order.amount,
              deliveryAmount: order.shipping,
              email: order.email,
              items: order.items,
              phone: order.phone,
              reference: order.slug,
              shippingInformation: {
                address1: order.line1,
                address2: order.line2,
                city: order.city,
                firstName: order.firstName,
                lastName: order.lastName,
                zipCode: order.zip,
              },
              status: order.status as "pending" | "success",
            }}
          />
        )
      )}
    </div>
  );
}

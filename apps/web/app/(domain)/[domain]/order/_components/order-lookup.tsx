"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderDetails } from "./order-details";
import { OrderSkeleton } from "./order-skeleton";

export function OrderLookup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const reference = searchParams.get("reference");

  const canLoad = !(!reference && !slug);
  const order = useQuery(
    api.orders.getOrderByReferenceOrSlug,
    !canLoad
      ? "skip"
      : {
        option: reference ? { reference } : { slug: slug! },
      }
  );

  const isPending = canLoad && order === undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = (e.target as HTMLFormElement).slug.value;
    router.push(`?slug=${slug}`, { scroll: false });
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
              // value={orderSlug}
              // onChange={(e) => setOrderId(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Searching..." : "Track Order"}
            </Button>
          </div>
        </div>
      </form>

      {!isPending && order === null && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Order not found. Please ensure you entered in the order number
          correctly.
        </div>
      )}

      {isPending ? (
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

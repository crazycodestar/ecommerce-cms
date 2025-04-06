"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderDetails } from "./order-details";
import { mockOrders } from "@/lib/mock-data";
import type { OrderType } from "@/lib/types";
import { OrderSkeleton } from "./order-skeleton";

export function OrderLookup() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<OrderType | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // In a real app, this would be an API call
      // For demo purposes, we're using mock data
      setTimeout(() => {
        const foundOrder = mockOrders.find((o) => o.reference === orderId);

        if (foundOrder) {
          setOrder(foundOrder);
          // Update URL with order ID for sharing/bookmarking
          router.push(`?orderId=${orderId}`, { scroll: false });
        } else {
          setError(
            "Order not found. Please check your order ID and try again."
          );
          setOrder(null);
        }
        setIsLoading(false);
      }, 800); // Simulate network delay
    } catch (err) {
      setError(
        "An error occurred while fetching your order. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID</Label>
          <div className="flex gap-2">
            <Input
              id="orderId"
              placeholder="Enter your order ID (e.g., ORD-12345)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </div>
        </div>
      </form>

      {error && !isLoading && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? <OrderSkeleton /> : order && <OrderDetails order={order} />}
    </div>
  );
}

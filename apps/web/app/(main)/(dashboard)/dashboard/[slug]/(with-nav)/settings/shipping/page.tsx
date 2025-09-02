"use client";

import { Separator } from "@/components/ui/separator";
import { api } from "@packages/backend/convex/_generated/api";
import { ShippingForm } from "../_components/shipping-form";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
export default function SettingsGeneralPage() {
  const { slug } = useParams<{ slug: string }>();
  const store = useQuery(api.stores.getStore, { slug });

  if (!store) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shipping Information</h3>
        <p className="text-sm text-muted-foreground">
          Manage your shipping settings here.
        </p>
      </div>
      <Separator />
      <ShippingForm
        defaultValues={{
          deliveryOptions: store.deliveryOptions,
        }}
        slug={slug}
      />
    </div>
  );
}

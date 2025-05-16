import { Separator } from "@/components/ui/separator";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getAuthToken } from "@/lib/auth";
import { ShippingForm } from "../_components/shipping-form";

export default async function SettingsGeneralPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getAuthToken();
  const store = await fetchQuery(api.stores.getStore, { slug }, { token });
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shipping Information</h3>
        <p className="text-sm text-muted-foreground">
          Manage your shipping settings here.
        </p>
      </div>
      <Separator />
      {store.deliveryInfo.deliveryType === "terminal" && (
        <ShippingForm defaultValues={store.deliveryInfo} slug={slug} />
      )}
    </div>
  );
}

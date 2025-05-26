import { Separator } from "@/components/ui/separator";
import { api } from "@packages/backend/convex/_generated/api";
import { getAuthToken } from "@/lib/auth";
import { fetchQuery } from "convex/nextjs";
import { PaymentForm } from "../_components/payment-form";

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
        <h3 className="text-lg font-medium">Payment Information</h3>
      </div>
      <Separator />
      <PaymentForm
        defaultValues={{ ...store }}
        slug={slug}
      />
    </div>
  );
}

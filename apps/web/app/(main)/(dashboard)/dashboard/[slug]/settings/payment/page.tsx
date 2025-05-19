import { Separator } from "@/components/ui/separator";
import { api } from "@packages/backend/convex/_generated/api";
import { getAuthToken } from "@/lib/auth";
import { fetchQuery } from "convex/nextjs";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
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
        <p className="text-sm text-muted-foreground">
          Payments are processed and managed with paystack.
          <Link
            className="text-blue-500 hover:underline inline-flex gap-1 items-center"
            href="https://paystack.com/"
            target="_blank"
          >
            Manage Account
            <SquareArrowOutUpRight className="size-3" />
          </Link>
        </p>
      </div>
      <Separator />
      <PaymentForm
        defaultValues={{ ...store, hasAddedWebhookAndCallbackURL: true }}
        slug={slug}
      />
    </div>
  );
}

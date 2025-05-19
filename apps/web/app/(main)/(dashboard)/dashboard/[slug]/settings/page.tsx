import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./_components/profile-form";
import { fetchQuery } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { getAuthToken } from "@/lib/auth";

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
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Manage your store information.
        </p>
      </div>
      <Separator />
      <ProfileForm
        defaultValues={{
          name: store.name,
          description: store.description,
        }}
        slug={slug}
      />
    </div>
  );
}

import { api } from "@packages/backend/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export default async function RedirectPage() {
  const token =
    (await (await auth()).getToken({ template: "convex" })) ?? undefined;
  const store = await fetchQuery(api.stores.getMyStore, {}, { token });
  if (store) return redirect(`/dashboard/${store.slug}`);

  return <div>{JSON.stringify(store, null, 2)}</div>;
}

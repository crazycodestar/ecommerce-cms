import type { Metadata } from "next";
import { Nav } from "./_components/nav";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your products and orders",
};

export default async function RootLayout({
  children,
}: {
  params: { slug: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="flex bg-background shrink-0 items-center border-b px-2 pt-2 justify-between">
        <Nav />
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

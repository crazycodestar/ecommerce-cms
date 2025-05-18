"use client";
import { MenuNav } from "@/components/menu-nav";
import { useParams, usePathname, useRouter } from "next/navigation";

export function Nav() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    {
      label: "Dashboard",
      route: `/dashboard/${slug}`,
    },
    {
      label: "Editor",
      route: `/dashboard/${slug}/editor_`,
    },
    {
      label: "Products",
      route: `/dashboard/${slug}/products`,
    },
    {
      label: "Orders",
      route: `/dashboard/${slug}/orders`,
    },
    {
      label: "Settings",
      route: `/dashboard/${slug}/settings`,
    },
  ];

  if (pathname?.includes("/editor_")) return null;

  return (
    <header className="flex bg-background shrink-0 items-center border-b px-2 pt-2 justify-between">
      <MenuNav
        active={pathname}
        onClick={(route) => router.push(route)}
        tabs={tabs}
      />
    </header>
  );
}

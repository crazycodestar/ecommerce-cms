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
      route: `/dashboard/${slug}/editor`,
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
  return (
    <MenuNav
      active={pathname}
      onClick={(route) => router.push(route)}
      tabs={tabs}
    />
  );
}

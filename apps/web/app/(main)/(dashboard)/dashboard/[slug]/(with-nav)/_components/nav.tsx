"use client";
import { MenuNav } from "@/components/menu-nav";
import { TopNav } from "@/components/top-nav";
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

  return (
    <>
      <header className="sticky top-0 z-10 flex flex-col shrink-0 border-b px-2 pt-2 justify-between bg-background">
        <TopNav />
        <MenuNav
          active={pathname}
          onClick={(route) => router.push(route)}
          tabs={tabs}
        />
      </header>
    </>
  );
}

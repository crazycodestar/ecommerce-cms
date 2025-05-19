import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: () => (
    <>
      <ScrollToTopOnNavigate />
      <div className="flex flex-col min-h-svh font-light tracking-wider">
        <Nav />
        <Outlet />
        <Footer />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});

function ScrollToTopOnNavigate() {
  const { location } = useRouterState();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); // only scroll on path change

  return null;
}

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/home", "/", "/chat"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Check custom domain
  const url = req.nextUrl;
  const searchParams = url.searchParams.toString();
  const pathname = url.pathname;
  const hostname = req.headers.get("host");

  const pathWithSearchParams = `${pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // if subdomain exists
  const domain = (process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL)!;
  const customSubDomain = hostname?.replace(domain, "");
  console.log(process.env.NODE_ENV);
  // @ts-expect-error preview branch not recognized
  const isPreviewBranch = process.env.NODE_ENV !== "preview";

  if (!isPreviewBranch && customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  // Authenticated user checks
  // For users visiting /onboarding, don't try to redirect
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req))
    return redirectToSignIn({ returnBackUrl: req.url });

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /onboading route to complete onboarding
  if (
    userId &&
    !isPublicRoute(req) &&
    !sessionClaims?.metadata?.onboardingComplete
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && !isPublicRoute(req)) return NextResponse.next();

  // UnAuthenticated user checks
  if (url.pathname === "/" || url.pathname === "/home")
    return NextResponse.rewrite(new URL("/home", req.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { type Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ConvexClientProvider } from "../ConvexClientProvider";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Convertly CMS",
  description: "A managed ecommerce solution for small businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <div className="min-h-svh flex flex-col">
        <header className="sticky top-0 z-50 backdrop-blur-lg container px-4 mx-auto flex justify-between items-center gap-4 h-18">
          <Image src="/logo.svg" alt="logo" width={56} height={56} />
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <Button size="sm" className="uppercase text-xs">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase text-xs"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button asChild size="sm" className="uppercase text-xs">
                <Link href={`/dashboard/`}>Dashboard</Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>
        </header>
        <article className="flex-1 flex flex-col">{children}</article>
      </div>
    </ConvexClientProvider>
  );
}

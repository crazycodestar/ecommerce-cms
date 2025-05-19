import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ConvexClientProvider } from "../ConvexClientProvider";
import { Footer } from "./_components/footer";

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
        <header className="sticky top-0 z-50 backdrop-blur-lg">
          <nav className="container px-4 mx-auto flex justify-between items-center gap-4 h-18">
            <Link href="/">
              <Image src="/logo.svg" alt="logo" width={56} height={56} />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="flex gap-2 items-center cursor-pointer"
              >
                <p className="uppercase text-xs">Chat</p>
                <Badge variant="outline">New</Badge>
              </Link>
              <SignedOut>
                <SignInButton>
                  <p className="uppercase text-xs cursor-pointer">Sign In</p>
                </SignInButton>
                <SignUpButton>
                  <Button
                    size="sm"
                    className="uppercase text-xs cursor-pointer"
                  >
                    Get Started
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
          </nav>
        </header>
        <article className="flex-1 flex flex-col">{children}</article>
        <Footer />
      </div>
    </ConvexClientProvider>
  );
}

import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-white bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]" />
      <AnimatedGroup
        preset="blur-slide"
        className="px-4 flex flex-col items-center"
      >
        <div className="flex items-center justify-center size-16 bg-gradient-to-br from-purple-500 to-red-500 rounded-md mb-6">
          <Image
            src="/vercel.svg"
            alt="logo"
            className="size-8"
            width="32"
            height="32"
          />
        </div>
        <h2 className="text-center text-pretty text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-6xl">
          Rebuilding{" "}
          <span className="animate-text-gradient bg-gradient-to-r from-purple-500 via-red-500 to-orange-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent">
            e-commerce{" "}
          </span>{" "}
          and giving <br className="hidden lg:block" /> smaller businesses
          opportunities
        </h2>
        <p className="mt-2 text-center text-pretty text-base md:text-lg leading-6 text-muted-foreground">
          Enabling over a 100+ vendors to sell to customers all over the world
        </p>
        {user ? (
          <Button className="mx-auto mt-6" asChild>
            <Link href={`/dashboard/`}>Dashboard</Link>
          </Button>
        ) : (
          <div className="w-full flex gap-4 justify-center mt-6">
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">Sign Up</Button>
            </SignUpButton>
          </div>
        )}
      </AnimatedGroup>
    </div>
  );
}

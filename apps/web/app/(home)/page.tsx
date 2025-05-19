import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AtSign, ScrollText, Trello } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FeatureCard } from "./_components/feature-card";

const features = [
  {
    name: "Email Marketing",
    Icon: AtSign,
  },
  {
    name: "Blogging",
    Icon: ScrollText,
  },
  {
    name: "Kanban board",
    Icon: Trello,
  },
];

export default async function Home() {
  return (
    <>
      <main className="md:ml-8 lg:ml-34 max-w-[1385px] grid grid-cols-1 gap-10 md:gap-4 md:grid-cols-[1fr_2fr] py-16">
        <div className="flex flex-col gap-6 justify-center ml-6 mr-6 sm:ml-16 sm:mr-16 md:ml-0 md:mr-0">
          <Badge asChild className="group font-semibold py-1 rounded-full">
            <Link href="/chat">
              Introducing our new AI chatbot out now
              <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Badge>
          <h1 className="text-2xl max-w-md md:text-3xl bg-gradient-to-r from-foreground via-primary to-primary bg-[150%_auto] bg-clip-text text-transparent">
            Your all in one kit for building ecommerce applications
          </h1>
          <p className="text-muted-foreground">
            ConvertlyKit is a powerful ecommerce platform that allows you to
            build and manage ecommerce applications and strategies marketing
            campaigns.
          </p>

          <Button asChild size="sm" className="w-fit uppercase text-xs">
            <Link href="/dashboard">Get started for free</Link>
          </Button>
        </div>
        <div className="w-full h-full overflow-x-clip relative">
          <Image
            src="/dashboard.png"
            className="object-contain ml-24 shadow-2xl rounded-md"
            alt="hero section image"
            width={2699}
            height={1633}
          />
          <div className="absolute -bottom-14 h-[180px] w-full bg-gradient-to-b from-transparent via-background/95 to-background" />
        </div>
      </main>

      {/* <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
          <h2 className="text-2xl md:text-3xl text-primary max-w-lg">
            Simple but powerful ecommerce suite that you can rely on
          </h2>
          <p className="text-muted-foreground">
            We don't slouch on the basics. We have powerful tooling from dead
            cart follow up, user behaviour modeling and email marketing
          </p>
        </div>
      </div> */}
      <div className="container px-4 md:px-8 mx-auto py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
          <h2 className="text-2xl md:text-3xl text-primary max-w-lg">
            Manage your store and coordinate your campaigns all on one platform
          </h2>
          <p className="text-muted-foreground">
            Tired of jumping between different tools, to manage your store, post
            your blog and strategise campaigns? Now you can do all of that an
            more seemlessly in just one place
          </p>
        </div>
        <div className="flex flex-col mt-16 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              image={<Image
                src="/socials.png"
                alt="socials"
                width={338}
                height={157}
              />}
              imageContainerClassName="pt-8 md:pt-0 md:px-4 lg:px-8 xl:px-0"
              title="Integrates with socials"
              description="Manage campaigns across socials"
            />
            <FeatureCard
              image={<Image
                src="/products.png"
                alt="products"
                width={434}
                height={305}
              />}
              title="Manage product inventory"
              description="Manage inventory in physical and online store"
            />
            <FeatureCard
              image={<Image
                src="/logistics.png"
                alt="logistics"
                width={266}
                height={122}
              />}
              imageContainerClassName="pt-8 md:pt-0 md:px-4"
              title="Logistics and shipping"
              description="Integrates with 20+ local and internal providers"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8">
            <FeatureCard
              image={<Image
                src="/scheduling.png"
                alt="scheduling"
                width={741}
                height={246}
                className="w-full pl-7"
              />}
              imageContainerClassName="pt-10 items-end"
              title="Coordinate campaigns"
              description="Schedule campaigns and posts across all platforms"
            />
            <FeatureCard
              image={<Image
                src="/site-builder.png"
                alt="site-builder"
                width={384}
                height={362}
              />}
              title="Build your site"
              description="Build your site with our easy to use site builder"
            />
          </div>
          <div className="mx-auto flex flex-col gap-2 items-center">
            <p className="text-center">And much more</p>
            <div className="flex gap-4">
              {features.map(({ name, Icon }, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Icon className="text-primary size-4" />
                  <p className="text-primary font-light">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container px-4 md:px-8 mx-auto py-16 h-[50vh] flex flex-col justify-center items-center gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-primary text-center">
            Get the most out of ecommerce
          </h1>
          <p className="text-muted-foreground text-center max-w-xl">
            Transform your business with smart ecommerce solutions that drive
            better outcomes. Our platform helps you boost sales, streamline
            operations, and deliver exceptional customer experiences.
          </p>
        </div>
        <Button className="uppercase text-xs" size="sm" asChild>
          <Link href="/dashboard">Get started for free</Link>
        </Button>
      </div>
    </>
  );
}

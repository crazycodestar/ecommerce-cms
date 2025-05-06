import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ComponentProps } from "react";

export default async function Chat() {
  return (
    <div>
      <main className="overflow-clip md:overflow-visible container mx-auto px-4 py-18 md:px-8 flex flex-col items-center">
        <div className="flex flex-col gap-3 items-center max-w-lg">
          <h1 className="text-pretty text-3xl md:text-5xl font-semibold bg-gradient-to-r from-foreground via-primary to-primary bg-[150%_auto] bg-clip-text text-transparent text-center">
            Never miss a potential customer again
          </h1>
          <p className="text-muted-foreground text-center">
            Use AI chatbots to talk with customers instantly, answer questions,
            and guide purchases automatically. Spend less time on repetitive
            tasks and more time growing your business.
          </p>

          <Button size="sm" className="w-fit uppercase text-xs">
            Join the waitlist
          </Button>
        </div>
        <div className="relative mt-12 flex gap-8 justify-center items-center w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-fit w-full flex justify-between max-w-6xl">
            <Image
              src="/left-widgets.png"
              alt="left-widgets"
              className="relative min-w-[250px] w-full max-w-xs object-contain mr-10"
              width={316}
              height={373}
            />
            <Image
              src="/right-widgets.png"
              alt="right-widgets"
              className="relative min-w-[250px] w-full max-w-xs object-contain ml-10"
              width={353}
              height={267.5}
            />
          </div>
          <Image
            className="min-w-[300px] w-[320px] lg:max-w-sm lg:w-full object-contain"
            src="/chat-screen.png"
            alt="chat-screen"
            width={458}
            height={605}
          />
          <div className="absolute -bottom-4 h-[120px] w-full bg-gradient-to-b from-transparent via-background/95 to-background" />
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
            Robust feature list to make sure you never miss a lead
          </h2>
          <p className="text-muted-foreground">
            We have a robust feature list that allows you to manage your leads
            and customers effectively.
          </p>
        </div>
        <div className="flex flex-col mt-16 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              image={{
                src: "/organization.png",
                alt: "organization",
                width: 238,
                height: 262,
              }}
              imageContainerClassName="pt-8"
              title="Team Collaboration"
              description="Work together with your team to manage your leads"
            />
            <FeatureCard
              image={{
                src: "/ai-messaging.png",
                alt: "ai-messaging",
                width: 343.06,
                height: 213.43,
              }}
              imageContainerClassName="pt-4"
              title="Messaging with AI"
              description="Automate conversations with AI powered chatbots"
            />
            <FeatureCard
              image={{
                src: "/integrations.png",
                alt: "integrations",
                width: 266,
                height: 122,
              }}
              imageContainerClassName="pt-8 md:pt-0 md:px-4"
              title="Socials Integration"
              description="Reach your customers on their favourite platforms"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8">
            <FeatureCard
              image={{
                src: "/analytics.png",
                alt: "analytics",
                width: 662,
                height: 235,
                className: "w-full px-10",
              }}
              imageContainerClassName="pt-4 items-end"
              title="Powerful Analytics"
              description="Get insights on your customers and their behaviour"
            />
            <FeatureCard
              image={{
                src: "/shortcuts.png",
                alt: "shortcuts",
                width: 354,
                height: 279,
              }}
              imageContainerClassName="pt-8"
              title="Shortcuts and Templates"
              description="Save time with templates and shortcuts"
            />
          </div>
          <div className="mx-auto flex flex-col gap-2 items-center">
            <p className="text-center text-primary">Much more coming soon</p>
          </div>
        </div>
      </div>
      <div className="container px-4 md:px-8 mx-auto py-16 h-[50vh] flex flex-col justify-center items-center gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-primary text-center">
            Turn leads into paying customers
          </h1>
          <p className="text-muted-foreground text-center max-w-xl">
            Take advantage of artificial intelligence to automation
            conversations over chat and improve conversion rate
          </p>
        </div>
        <Button className="uppercase text-xs" size="sm">
          Join the waitlist
        </Button>
      </div>
      <Footer />
    </div>
  );
}

const FeatureCard = ({
  image,
  title,
  description,
  imageContainerClassName,
}: {
  image: ComponentProps<typeof Image>;
  title: string;
  description: string;
  imageContainerClassName?: string;
}) => {
  return (
    <div className="flex flex-col gap-4 bg-muted/60 rounded-lg pb-8">
      <div
        className={cn(
          "w-full h-full flex flex-col justify-center items-center",
          imageContainerClassName
        )}
      >
        <Image {...image} />
      </div>
      <div className="px-8">
        <h3 className="text-xl">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="border-t px-4 md:px-8">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="logo" width={50} height={50} />
              <span className="font-semibold text-primary">ConvertlyKit</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>convertlybusinesses@gmail.com</p>
              <p>Nigeria, Lagos Ikoyi</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Socials</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#">X</a>
              <a href="#">LinkedIn</a>
              <a href="#">Instagram</a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">About</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#">Contact us</a>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Get Started</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#">Sign in</a>
              <a href="#">Log in</a>
              <a href="#">Pricing</a>
              <a href="#">Blog</a>
              <a href="#">Case Studies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

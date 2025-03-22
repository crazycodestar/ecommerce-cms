import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  // const store = useQuery(api.stores.getStore, { slug });

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <AnimatedGroup
        preset="blur-slide"
        className="flex flex-col px-10 justify-center items-center gap-2"
      >
        <div className="p-4 rounded-full text-yellow-700 bg-yellow-100">
          <Clock className="size-6" />
        </div>
        <div className="text-center">
          <h2 className="font-bold">Dashboard Coming Soon</h2>
          <p className="text-muted-foreground">
            More features are coming along the way
          </p>
        </div>
        <Button asChild>
          <Link href={`./${slug}/products`}>View products</Link>
        </Button>
      </AnimatedGroup>
    </div>
  );
}

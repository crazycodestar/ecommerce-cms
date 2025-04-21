import Link from "next/link";
import { ContentImage } from "../../app/(main)/(dashboard)/dashboard/[slug]/editor/_components/content-image";
import { Id } from "@/convex/_generated/dataModel";

interface BannerProps {
  imageId: Id<"_storage">;
  link: string;
}

export const Banner = ({ imageId, link }: BannerProps) => {
  return (
    <Link href={link} className="block w-full">
      <ContentImage
        imageId={imageId}
        alt="Banner image"
        width={1880}
        height={360}
        skeletonClassName="h-[360px]"
        className="w-full h-auto"
        priority
      />
    </Link>
  );
};

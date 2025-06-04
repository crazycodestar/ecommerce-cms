import Link from "next/link";
import { ContentImage } from "./content-image";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface BannerComponentProps {
    imageId: Id<"_storage">;
    link: string;
}

export const BannerComponent = ({ imageId, link }: BannerComponentProps) => {
    return (
        <Link href={link} className="block w-full container mx-auto px-2 my-12">
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
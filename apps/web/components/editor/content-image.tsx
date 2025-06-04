import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import Image from "next/image";

export const ContentImage = ({
    imageId,
    className,
    priority,
    width,
    height,
    alt,
    skeletonClassName,
}: {
    imageId: Id<"_storage">;
    className?: string;
    priority?: boolean;
    width: number;
    height: number;
    alt: string;
    skeletonClassName?: string;
}) => {
    const imageUrl = useQuery(api.contents.getImageUrl, { imageId });
    if (imageUrl === undefined) {
        return (
            <div className={cn("w-full aspect-square", skeletonClassName)}>
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    return (
        <Image
            src={imageUrl || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            className={cn("object-cover", className)}
            priority={priority}
        />
    );
};
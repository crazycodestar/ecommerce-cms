import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fetchAPI } from "@/api";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useEffect, useState } from "react";

export const ContentImage = ({
  imageId,
  className,
  width,
  height,
  alt,
  skeletonClassName,
}: {
  imageId: string;
  className?: string;
  priority?: boolean;
  width: number;
  height: number;
  alt: string;
  skeletonClassName?: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await fetchAPI(API_ENDPOINTS.contents.getImageUrl, {
          params: { imageId },
        });
        setImageUrl(url as string);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [imageId]);

  if (isLoading) {
    return (
      <div className={cn("w-full aspect-square", skeletonClassName)}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
    />
  );
};

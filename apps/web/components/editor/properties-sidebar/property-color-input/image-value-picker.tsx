import { ColorSchema, ImageSchema } from "./shared";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useTransition } from "react";
import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";

export function ImageValuePicker({
  image,
  onChange,
}: {
  image: ColorSchema & { type: "image" };
  onChange: (image: ColorSchema & { type: "image" }) => void;
}) {
  const imageUrl = useQuery(
    api.images.getImageUrl,
    image.value
      ? {
          imageId: image.value as Id<"_storage">,
        }
      : "skip"
  );

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const [isUploading, startUploading] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  async function uploadImage(fileList: FileList | null) {
    if (!fileList) return;
    const file = fileList[0];

    startUploading(async () => {
      const postUrl = await generateUploadUrl();
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      onChange({ ...image, value: storageId });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        value={image.objectFit}
        onValueChange={(value) =>
          onChange({ ...image, objectFit: value as ImageSchema["objectFit"] })
        }
      >
        <SelectTrigger className="max-h-7" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fill">Fill</SelectItem>
          <SelectItem value="cover">Cover</SelectItem>
          <SelectItem value="contain">Contain</SelectItem>
          <SelectItem value="tile">Tile</SelectItem>
        </SelectContent>
      </Select>
      {isUploading ? (
        <div className="relative w-full aspect-square group">
          <Loader2 className="animate-spin size-4" />
        </div>
      ) : (
        <div className="relative w-full aspect-square group">
          <Image
            src={imageUrl ?? "/placeholder.svg"}
            alt="image"
            fill
            className="object-contain rounded-md"
          />
          <div className="absolute inset-0 bg-black/20 rounded-md hidden justify-center items-center group-hover:flex">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple={false}
              onChange={(e) => uploadImage(e.currentTarget.files)}
              className="hidden"
            />
            <Button
              onClick={() => inputRef.current?.click()}
              type="button"
              size="sm"
              className="h-7"
              disabled={isUploading}
            >
              Upload image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

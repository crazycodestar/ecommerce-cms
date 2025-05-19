"use client";

import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  useFileUpload,
} from "@/components/file-uploader";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";
import type { DropzoneOptions } from "react-dropzone";
import { UseFieldArrayReturn } from "react-hook-form";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader, Trash2 } from "lucide-react";

type ImageSchema = {
  imageIds: {
    imageId: string;
  }[];
};
interface ImagePickerProps {
  fieldArray: UseFieldArrayReturn<ImageSchema, "imageIds", "id">;
  containerClassName?: string;
  imageClassName?: string;
}

export function ImagePicker({
  fieldArray: { fields, append, remove },
  containerClassName,
  imageClassName,
}: ImagePickerProps) {
  const [initialImageIdCount, setInitialImageIdCount] = useState(fields.length);
  // useEffect(() => {
  //   setInitialImageIdCount(fields.length);
  // }, []);
  const [files, setFiles] = useState<File[] | null>([]);
  const generateUploadUrl = useMutation(api.contents.generateUploadUrl);
  // const { fields, append, remove } = useFieldArray({ control, name });

  async function uploadImage(file: File) {
    // FIXME: add a useTransition here
    const imageUrl = await generateUploadUrl();
    const result = await fetch(imageUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const { storageId } = await result.json();
    append({ imageId: storageId });
  }

  function handleInitialSetRemove(index: number) {
    remove(index);
    setInitialImageIdCount((init) => init - 1);
  }

  function handleSetFiles(newFiles: File[] | null) {
    const leaving = files
      ?.reduce(
        (acc, next, index) =>
          !newFiles?.includes(next) ? [...acc, index] : acc,
        [] as number[]
      )
      .map((n) => n + initialImageIdCount);
    const add = newFiles?.filter((f) => !files?.includes(f));

    // remove
    remove(leaving);
    // add
    add?.forEach((f) => uploadImage(f));

    setFiles(newFiles);
  }

  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: true,
    maxFiles: 12,
    maxSize: 5 * 1024 * 1024,
  } satisfies DropzoneOptions;
  // const files = (fields.map(f => f.file as File | undefined)).filter(f => f !== undefined);

  return (
    <FileUploader
      value={files}
      onValueChange={handleSetFiles}
      dropzoneOptions={dropzone}
    >
      {!fields ||
        (!fields.length && (
          <FileInput>
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full border bg-background rounded-md">
              <svg
                className="size-6 mb-3 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
                &nbsp; or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or JPEG
              </p>
            </div>
          </FileInput>
        ))}
      {fields?.length ? (
        <FileUploaderContent
          className={cn("grid grid-cols-4 w-full gap-2", containerClassName)}
        >
          {fields.length < 12 && (
            <FileInput>
              <div
                className={cn(
                  "flex flex-col items-center justify-center aspect-square w-full border bg-background rounded-md",
                  imageClassName
                )}
              >
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400 text-center">
                  <span className="font-semibold">Click to upload</span>
                  <br />
                  or drag and drop
                </p>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  PNG, JPG or JPEG
                </p>
              </div>
            </FileInput>
          )}
          {fields
            .filter((_, i) => i < initialImageIdCount)
            .map(({ imageId }, index) => (
              <ImageItem
                imageId={imageId as unknown as Id<"_storage">}
                imageClassName={imageClassName}
                onRemove={handleInitialSetRemove}
                index={index}
                key={index}
              />
            ))}
          {files?.map((file, i) => {
            const isLoading = !fields[i + initialImageIdCount]?.imageId;
            return (
              <ImageUploaderItem
                imageClassName={imageClassName}
                key={i}
                file={file}
                index={i}
                isLoading={isLoading}
              />
            );
          })}
        </FileUploaderContent>
      ) : null}
    </FileUploader>
  );
}

function ImageItem({
  imageId,
  imageClassName,
  onRemove,
  index,
}: {
  imageId: Id<"_storage">;
  imageClassName?: string;
  onRemove: (index: number) => void;
  index: number;
}) {
  const imageUrl = useQuery(api.contents.getImageUrl, {
    imageId: imageId,
  });

  const isLoading = imageUrl === undefined;
  if (isLoading)
    return <Skeleton className="w-full aspect-square rounded-md" />;

  // FIXME: proper error state
  // FIXME: Option to remove Image
  const noImage = imageUrl === null;
  if (noImage)
    return (
      <div
        className={cn("w-full aspect-square rounded-md p-4", imageClassName)}
      >
        no Image Found
      </div>
    );

  return (
    <div
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "h-6 p-1 justify-between cursor-pointer relative",
        "w-full h-fit p-0 rounded-md overflow-hidden border"
      )}
    >
      <div className="font-medium leading-none tracking-tight flex items-center gap-1.5 h-full w-full">
        <Image
          src={imageUrl}
          alt={"image"}
          height={80}
          width={80}
          className={cn(
            "w-full aspect-square object-contain p-0",
            imageClassName
          )}
        />
      </div>
      <button
        type="button"
        className={cn("absolute", "top-1 right-1")}
        onClick={() => onRemove(index)}
      >
        <span className="sr-only">remove item</span>
        <Trash2 className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
      </button>
    </div>
  );
}

interface ImageUploaderItemProps<T extends number> {
  file: File;
  index: T;
  isLoading: boolean;
  imageClassName?: string;
}

function ImageUploaderItem<T extends number>({
  file,
  index,
  isLoading = true,
  imageClassName,
}: ImageUploaderItemProps<T>) {
  const { removeFileFromSet } = useFileUpload();
  function handleRemoveFileFromSet(index: T) {
    return removeFileFromSet(index);
  }

  return (
    <div
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "h-6 p-1 justify-between cursor-pointer relative",
        "w-full h-fit p-0 rounded-md overflow-hidden border",
        isLoading && "cursor-wait"
      )}
      key={index}
      aria-roledescription={`file ${index + 1} containing ${file.name}`}
    >
      <div className="font-medium leading-none tracking-tight flex items-center gap-1.5 h-full w-full">
        <Image
          src={URL.createObjectURL(file)}
          alt={file.name}
          height={80}
          width={80}
          className={cn(
            "w-full aspect-square object-contain p-0",
            imageClassName
          )}
        />
      </div>
      {isLoading && (
        <div className="absolute z-20 top-0 left-0 w-full h-full flex justify-center items-center bg-background/90">
          <Loader className="animate-spin size-4" />
        </div>
      )}
      <button
        type="button"
        disabled={isLoading}
        className={cn("absolute", "top-1 right-1")}
        onClick={() => handleRemoveFileFromSet(index)}
      >
        <span className="sr-only">remove item {index}</span>
        <Trash2 className="w-4 h-4 hover:stroke-destructive duration-200 ease-in-out" />
      </button>
    </div>
  );
}

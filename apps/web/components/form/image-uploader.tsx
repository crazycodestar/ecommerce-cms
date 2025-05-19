"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { tryCatch } from "@/lib/try-catch";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useDropzone } from "react-dropzone";
import {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

export function ImageUploader<T extends FieldValues>({
  control,
  name,
  label,
  accept,
}: {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  accept?: Record<string, string[]>;
}) {
  const value = useWatch({ control, name });
  const preview =
    useQuery(
      api.contents.getImageUrl,
      !value ? "skip" : { imageId: value as unknown as Id<"_storage"> }
    ) ?? null;

  const generateUploadUrl = useMutation(api.contents.generateUploadUrl);
  const [isUploading, startUploading] = React.useTransition();
  // Custom image upload field
  const ImageUploadField = ({
    field,
  }: {
    field: ControllerRenderProps<T, Path<T>>;
  }) => {
    async function uploadImage(file: File) {
      startUploading(async () => {
        const { data: imageUrl, error } = await tryCatch(generateUploadUrl());
        if (error) {
          console.error("Upload failed:", error);
          toast.error("There was an error uploading your image.");
          return;
        }

        const { data: result, error: fetchError } = await tryCatch(
          fetch(imageUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          })
        );

        if (fetchError) {
          console.error("Upload failed:", error);
          toast.error("There was an error uploading your image.");
          return;
        }

        const { storageId } = await result.json();

        // Update the form with the image ID
        field.onChange(storageId);

        toast.success("Your image has been uploaded.");
      });
    }

    // Configure dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: accept ?? {
        "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      },
      maxFiles: 1,
      onDrop: async (acceptedFiles) => {
        if (acceptedFiles?.length) {
          await uploadImage(acceptedFiles[0]);
        }
      },
    });

    // Clear the uploaded image
    const handleClear = () => {
      field.onChange("");
      //   setPreview(null);
    };

    return (
      <div className="space-y-4">
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <Upload className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Drop the image here"
                  : "Drag & drop an image here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to select a file
              </p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image
              src={preview || "/placeholder.svg"}
              height={40}
              width={80}
              alt="Preview"
              className="w-full h-40 object-contain"
            />
            <Button
              type="button"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={handleClear}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <ImageUploadField field={field} />
          </FormControl>
          <FormDescription>
            Upload an image by dragging and dropping or clicking to browse.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

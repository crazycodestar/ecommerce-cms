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
import { contentsAPI } from "@/api";
import { tryCatch } from "@/lib/try-catch";
import { Loader2, Upload, X } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import type {
  Control,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";

export function ImageUploader<T extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<T>;
  name: Path<T>;
  label?: string;
}) {
  const value = useWatch({ control, name });
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isUploading, startUploading] = React.useTransition();

  React.useEffect(() => {
    if (value) {
      contentsAPI.getImageUrl(value).then((url) => setPreview(url));
    } else {
      setPreview(null);
    }
  }, [value]);

  // Custom image upload field
  const ImageUploadField = ({
    field,
  }: {
    field: ControllerRenderProps<T, Path<T>>;
  }) => {
    async function uploadImage(file: File) {
      startUploading(async () => {
        const { data: uploadUrl, error } = await tryCatch(
          contentsAPI.generateUploadUrl()
        );
        if (error) {
          console.error("Upload failed:", error);
          toast.error("There was an error uploading your image.");
          return;
        }

        const { data: result, error: fetchError } = await tryCatch(
          fetch(uploadUrl, {
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
      accept: {
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
      setPreview(null);
    };

    return (
      <div className="space-y-4">
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed  p-6 transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <Upload className="size-4 text-muted-foreground" />
              <p className="text-sm font-normal">
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
          <div className="relative  overflow-hidden border border-border">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-40 object-contain"
            />
            <Button
              type="button"
              size="icon"
              className="absolute top-2 right-2 "
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

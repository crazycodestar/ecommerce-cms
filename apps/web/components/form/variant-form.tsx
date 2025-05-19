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
import { Input } from "@/components/ui/input";
import React from "react";
import {
  ArrayPath,
  Control,
  FieldValues,
  Path,
  useFieldArray,
  UseFieldArrayProps,
  UseFieldArrayReturn,
  UseFormReturn,
} from "react-hook-form";
import * as z from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@packages/backend/convex/_generated/api";
import { cn } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";
import { useMutation } from "convex/react";
import { MinusCircle, PlusCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "./form-input";

type TypedFieldValues = z.infer<typeof productSchema>;

type TypedControl = UseFormReturn<TypedFieldValues>["control"];

type VariantProps = UseFieldArrayProps<TypedFieldValues, "variants">;
type VariantPath = VariantProps["name"];

interface VariantFormProps {
  fieldArray: UseFieldArrayReturn<
    z.infer<typeof productSchema>,
    "variants",
    "id"
  >;
  control: TypedControl;
  name: VariantPath;
}

export function VariantForm({ fieldArray, control, name }: VariantFormProps) {
  const { fields, append, remove } = fieldArray;
  function handleAppend() {
    append({
      name: "",
      options: [
        {
          imageId: "",
          isUnspecified: false,
          name: "",
          price: 0,
          stock: 0,
        },
      ],
    });
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {fields.map((field, index) => (
        <div className="flex flex-col py-4 border rounded-md" key={field.id}>
          <div className="px-4 pb-4 border-b">
            <FormInput
              control={control}
              name={`${name}.${index}.name`}
              label="Variant Name"
              placeholder="Variant Name"
            />
          </div>
          <Temp2
            key={field.id}
            control={control}
            field={field}
            index={index}
            name={`${name}.${index}.options`}
          />

          <div className="px-4 flex flex-col">
            <Button
              variant="outline"
              onClick={() => remove(index)}
              type="button"
            >
              <MinusCircle className="size-4" />
              Remove Variant
            </Button>
          </div>
        </div>
      ))}
      <Button onClick={handleAppend} type="button">
        <PlusCircle className="size-4" />
        Add Variants
      </Button>
    </div>
  );
}

interface Temp2Props<T extends TypedFieldValues> {
  field: z.infer<typeof productSchema>["variants"][number];
  control: Control<T>;
  name: Path<T>;
  index: number;
}

const Temp2 = <T extends TypedFieldValues>({
  control,
  index,
  // optionsFieldArray,
  name,
}: Temp2Props<T>) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-0">
          {fields.map((optionField, optionIndex) => (
            <OptionForm
              key={optionField.id}
              // @ts-expect-error fix later
              control={control}
              // @ts-expect-error fix later
              name={field.name as Path<T>}
              index={index}
              optionIndex={optionIndex}
              onRemove={(index) => remove(index)}
            />
          ))}

          <div className="px-4 pb-2 pt-4 flex flex-col">
            <Button
              onClick={() =>
                append({
                  // @ts-expect-error fix later
                  // imageId: undefined,
                  isUnspecified: false,
                  name: "",
                  price: 0,
                  stock: 0,
                })
              }
              type="button"
            >
              Add Option
            </Button>
          </div>
        </FormItem>
      )}
    />
  );
};

type TypedOptionFieldValues = TypedFieldValues["variants"][number]["options"];
interface OptionFormProps<T extends TypedOptionFieldValues> {
  control: Control<T>;
  name: Path<T>;
  index: number;
  optionIndex: number;
  onRemove: (index: number) => void;
}

const OptionForm = <T extends TypedOptionFieldValues>({
  control,
  name,
  optionIndex,
  onRemove,
}: OptionFormProps<T>) => {
  {
    return (
      <div className="gap-4 flex flex-col border-b p-4">
        <OptionField
          control={control}
          name={`${name}.${optionIndex}.imageId` as Path<T>}
          // name={`${name}.${index}.options.${optionIndex}.name` as Path<T>}
          label="Image (optional)"
          description="jpeg, png, webp. Max size 5MB"
          type="file"
        />
        <OptionField
          control={control}
          name={`${name}.${optionIndex}.name` as Path<T>}
          // name={`${name}.${index}.options.${optionIndex}.name` as Path<T>}
          label="Option Name"
        />
        <OptionField
          control={control}
          name={`${name}.${optionIndex}.price` as Path<T>}
          label="Additional Price"
          type="number"
        />
        {/* FIXME: disable when value is unspecified */}
        <OptionField
          control={control}
          name={`${name}.${optionIndex}.stock` as Path<T>}
          label="Stock"
          type="number"
        />
        <OptionField
          control={control}
          name={`${name}.${optionIndex}.isUnspecified` as Path<T>}
          label="Unspecified Stock"
          type="checkbox"
        />
        <Button
          onClick={() => onRemove(optionIndex)}
          type="button"
          variant="outline"
        >
          Remove Option
        </Button>
      </div>
    );
  }
};

interface OptionFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  type?: React.ComponentProps<typeof Input>["type"];
}

function OptionField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  type = "text",
}: OptionFieldProps<T>) {
  // const { options, name: label, type } = property;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-2 gap-2 items-center">
          <div>
            <FormLabel className="text-base font-normal">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
          <>
            {type !== "file" && type !== "checkbox" && (
              <FormControl>
                <Input type={type} placeholder={`Enter ${label}`} {...field} />
              </FormControl>
            )}
            {type === "file" && (
              <FormControl>
                <ImagePicker value={field.value} onChange={field.onChange} />
              </FormControl>
            )}
            {type === "checkbox" && (
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                >
                  {label}
                </Checkbox>
              </FormControl>
            )}
          </>
        </FormItem>
      )}
    />
  );
}

interface ImagePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function ImagePicker({ value, onChange }: ImagePickerProps) {
  // const [files, setFiles] = useState<FileList | null>(null);
  const [isPending, setPending] = React.useState(false);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  // const { fields, append, remove } = useFieldArray({ control, name });

  async function uploadImage(fileList: FileList | null) {
    if (!fileList) return;
    const file = fileList[0];

    setPending(true);
    try {
      const imageUrl = await generateUploadUrl();
      const result = await fetch(imageUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error(`Upload failed please try again`);

      const { storageId } = await result.json();
      onChange(storageId);
    } catch (error) {
      console.error("Image Upload Error: ", error);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const inputRef = React.useRef<HTMLInputElement>(null);
  function handleReuploadImage() {
    if (!inputRef.current) return;
    inputRef.current.click();
  }

  return (
    <div className="flex flex-row gap-2">
      <Input
        ref={inputRef}
        disabled={isPending}
        className={cn(value && "hidden")}
        type="file"
        onChange={(e) => uploadImage(e.currentTarget.files)}
        accept="image/*"
        multiple={false}
      />
      {value && (
        <Input
          disabled={isPending}
          value={isPending ? "uploading..." : "Image Uploaded"}
          readOnly
        />
      )}
      {value && (
        <Button
          type="button"
          size="icon"
          onClick={handleReuploadImage}
          variant="outline"
        >
          <RefreshCcw />
        </Button>
      )}
    </div>
  );
}

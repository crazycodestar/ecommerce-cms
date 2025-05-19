"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { ReactNode, useEffect, useState, useTransition } from "react";
import {
  Control,
  FieldValues,
  Path,
  UseFieldArrayReturn,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import * as z from "zod";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { showErrorToast } from "@/lib/handle-error";
import { cn } from "@/lib/utils";
import {
  productSchema,
  Property,
  PropertyType,
} from "@/lib/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Loader, Plus, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";

// FIXME: do optional property fields

interface PropertyFieldArrayProps<T extends FieldValues> {
  categoryId: Id<"categories">;
  fieldArray: UseFieldArrayReturn<
    z.infer<typeof productSchema>,
    "properties",
    "id"
  >;
  control: Control<T>;
  name: Path<T>;
}

const CreatePropertySchema = z.object({
  name: z.string().min(1, { message: "Atleast one character is required" }),
  type: PropertyType,
});

type CreatePropertySchema = z.infer<typeof CreatePropertySchema>;

const propertyValueMap = {
  string: "",
  number: 0,
  array: [],
};

export function PropertyFieldArray<T extends FieldValues>({
  control,
  name,
  categoryId,
  fieldArray,
}: PropertyFieldArrayProps<T>) {
  const { fields, append, remove } = fieldArray;
  const fieldsRef = React.useRef(fields);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const properties = useQuery(api.products.getPropertiesByCategoryId, {
    categoryId,
  });

  // FIXME: update form list
  useEffect(() => {
    if (!properties) return;
    // remove fields that aren't in the new properties set
    const toRemove = fieldsRef.current.reduce(
      (agg, f, index) =>
        !properties.find((p) => p._id === f.property.key)
          ? [index, ...agg]
          : [...agg],
      [] as number[]
    );
    // add new properties that aren't in the fields set
    const toAdd = properties.reduce(
      (agg, p) =>
        !fieldsRef.current.find((f) => f.property.key === p._id)
          ? [p, ...agg]
          : [...agg],
      [] as typeof properties
    );
    remove(toRemove);
    append(
      toAdd.map((p) => ({
        property: {
          key: p._id,
          type: p.type,
        },
        value: propertyValueMap[p.type] ?? "",
      }))
    );
  }, [properties, append, remove]);

  const createProperty = useMutation(api.products.createProperty);
  const [isPending, startTransition] = useTransition();

  function addProperty({ name, type }: CreatePropertySchema) {
    startTransition(async () => {
      try {
        const propertyId = await createProperty({
          categoryId,
          name,
          type,
        });

        toast.success("Property created successfully");
        append({
          property: {
            key: propertyId,
            type,
          },
          value:
            type === "string"
              ? ""
              : type === "number"
                ? 0
                : type === "array"
                  ? []
                  : "",
        });
        setIsDialogOpen(false);
      } catch (err) {
        showErrorToast(err);
      } finally {
        form.reset();
      }
    });
  }

  function handleSelectPreset({ key, type }: Property) {
    setIsDialogOpen(false);
    const isUsed = !!fields.find((f) => f.property.key === key);
    if (isUsed) return toast.error("Duplicate properties not allowed");
    append({
      property: {
        key,
        type,
      },
      value:
        type === "string"
          ? ""
          : type === "number"
            ? 0
            : type === "array"
              ? []
              : "",
    });
  }

  const form = useForm<CreatePropertySchema>({
    resolver: zodResolver(CreatePropertySchema),
    defaultValues: {
      name: "",
      type: "string",
    },
  });

  return (
    <div className="flex flex-col gap-2 py-4">
      {fields.map((field, index) => (
        <PropertyField
          control={control}
          name={`${name}.${index}.value` as Path<T>}
          id={field.property.key as unknown as Id<"properties">}
          key={field.id}
          onRemove={() => remove(index)}
        />
      ))}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            <PlusCircle className="size-4" />
            Add Property
          </Button>
        </DialogTrigger>
        <div className="relative">
          <DialogContent className="flex flex-col sm:max-h-[min(640px,80vh)] sm:max-w-lg p-0 gap-0">
            <DialogHeader className="border-b p-6 pb-3">
              <DialogTitle>Add Property</DialogTitle>
              <DialogDescription>
                Specify the name of the property and it&apos;s type.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto mb-16 p-6 pb-0">
              <PropertyForm
                onSelectPreset={handleSelectPreset}
                categoryId={categoryId}
                form={form}
                onSubmit={addProperty}
              >
                <div className="absolute w-full justify-end flex gap-2 bg-background rounded-b-md border-t bottom-0 right-0 p-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button disabled={isPending}>
                    {isPending && (
                      <Loader className="mr-2 size-4 animate-spin" />
                    )}
                    Add Property
                  </Button>
                </div>
              </PropertyForm>
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
}

const dbToHumanRedable = {
  string: "Text",
  number: "Number",
  array: "List",
};

interface PropertyFormProps {
  form: UseFormReturn<CreatePropertySchema>;
  onSubmit: (data: CreatePropertySchema) => void;
  onSelectPreset: (data: Property) => void;
  children: ReactNode;
  categoryId: Id<"categories">;
}

function PropertyForm({
  form,
  onSubmit,
  onSelectPreset,
  children,
  categoryId,
}: PropertyFormProps) {
  const presets = useQuery(api.products.getPropertiesByCategoryId, {
    categoryId,
  });
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
          e.stopPropagation();
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex rounded-lg shadow-sm shadow-black/5">
                <Input
                  id="input-18"
                  className="-me-px rounded-e-none shadow-none focus-visible:z-10"
                  placeholder="Property Name"
                  type="text"
                  {...field}
                />
                <div className="relative inline-flex">
                  <select
                    className="peer inline-flex h-full appearance-none items-center rounded-none rounded-e-lg border border-input bg-background pe-8 ps-3 text-sm text-muted-foreground transition-shadow hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Domain suffix"
                    defaultValue="string"
                    {...form.register("type")}
                  >
                    <option value="string">Text</option>
                    <option value="number">Number</option>
                    {/* <option value="array">List</option> */}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 end-0 z-10 flex h-full w-9 items-center justify-center text-muted-foreground/80 peer-disabled:opacity-50">
                    <ChevronDown
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      role="img"
                    />
                  </span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* FIXME: add loading state */}
        <ul className="border rounded-md">
          {presets?.map((p, index) => (
            <li
              key={index}
              className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted cursor-pointer border-b text-foreground"
              onClick={() => onSelectPreset({ key: p._id, type: p.type })}
            >
              <div>
                <h3>{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.options ? `${p.options.length} options` : "No Options"}
                </p>
              </div>
              <p className="text-sm">{dbToHumanRedable[p.type] ?? ""}</p>
            </li>
          ))}
        </ul>
        {children}
      </form>
    </Form>
  );
}

interface PropertyFieldProps<T extends FieldValues> {
  id: Id<"properties">;
  control: Control<T>;
  name: Path<T>;
  onRemove: () => void;
}

function PropertyField<T extends FieldValues>({
  control,
  name,
  id,
  onRemove,
}: PropertyFieldProps<T>) {
  const property = useQuery(api.products.getPropertyById, { id });
  if (!property)
    return (
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="w-[80px] h-4 rounded-md" />
        <Skeleton className="w-full h-9 rounded-md" />
      </div>
    );

  const { options, name: label, type } = property;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-2 gap-2 items-center">
          <div>
            <FormLabel className="text-base font-normal">
              {property?.name}
            </FormLabel>
            <FormMessage />
          </div>
          <FormControl>
            <div className="flex gap-2">
              {options ? (
                <CommandSelectInput
                  options={options}
                  label={label}
                  {...field}
                />
              ) : (
                <Input type={type} placeholder={`Enter ${label}`} {...field} />
              )}
              <Button
                onClick={onRemove}
                className="shrink-0"
                variant="outline"
                size="icon"
              >
                <X className="size-4" />
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

interface CommandSelectInputProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function CommandSelectInput({
  label,
  value,
  options,
  onChange,
}: CommandSelectInputProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [newValue, setNewValue] = useState("");

  return (
    <Dialog>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="select-42"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value ? value : `Select ${label}`}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={`Find ${label}`} />
            <CommandList>
              <CommandEmpty className="p-1">
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-normal"
                  >
                    <Plus
                      size={16}
                      strokeWidth={2}
                      className="-ms-2 me-2 opacity-60"
                      aria-hidden="true"
                    />
                    New {label}
                  </Button>
                </DialogTrigger>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {option}
                    {value === option && (
                      <Check size={16} strokeWidth={2} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-normal"
                  >
                    <Plus
                      size={16}
                      strokeWidth={2}
                      className="-ms-2 me-2 opacity-60"
                      aria-hidden="true"
                    />
                    New {label}
                  </Button>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {label}</DialogTitle>
          <DialogDescription>
            Add an option that fits your needs.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.currentTarget.value)}
                id="dialog-email"
                className="peer ps-9"
                placeholder={`Add ${label}`}
                type="input"
                aria-label="Email"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Plus size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button
              disabled={!newValue}
              onClick={() => onChange(newValue)}
              type="button"
              className="w-full"
            >
              Add {label}
            </Button>
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  );
}

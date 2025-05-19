import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/handle-error";
import { productSchema } from "@/lib/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, Loader, PlusCircle, X } from "lucide-react";
import React, { useState } from "react";
import { UseFieldArrayReturn, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export const metadataSchema = z.object({
  name: z.string().min(1, { message: "Field name is required" }),
  type: z.union([z.literal("string"), z.literal("number"), z.literal("image")]),
});

export type MetadataSchema = z.infer<typeof metadataSchema>;

interface MetadataFormInterface {
  form: UseFormReturn<z.infer<typeof productSchema>>;
  fieldArray: UseFieldArrayReturn<
    z.infer<typeof productSchema>,
    "metadatas",
    "id"
  >;
}

export const MetadataForm = ({ fieldArray, form }: MetadataFormInterface) => {
  const { fields, append, remove } = fieldArray;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createMetadata = useMutation(api.products.createMetadata);
  const [isPending, startTransition] = React.useTransition();

  function addMetadata({ name, type }: MetadataSchema) {
    startTransition(async () => {
      try {
        const metadataId = await createMetadata({
          name,
          type,
        });
        metadataForm.reset();
        toast.success("Metadata created successfully");
        append({
          _id: metadataId,
        });
        setIsDialogOpen(false);
      } catch (err) {
        console.error(err);
        showErrorToast(err);
      } finally {
        form.reset();
      }
    });
  }

  function handleSelectPreset({ _id }: { _id: Id<"metadatas"> }) {
    setIsDialogOpen(false);
    const isUsed = !!fields.find((f) => f._id === _id);
    if (isUsed) return toast.error("Duplicate metadata not allowed");
    append({
      _id,
    });
  }

  const metadataForm = useForm<MetadataSchema>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      name: "",
      type: "string",
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <MetadataField
          key={field.id}
          field={{
            _id: field._id as Id<"metadatas">,
          }}
          onRemove={() => remove(index)}
        />
      ))}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button">
            <PlusCircle className="size-4" />
            Add Metadata
          </Button>
        </DialogTrigger>
        <div className="relative">
          <DialogContent className="flex flex-col sm:max-h-[min(640px,80vh)] sm:max-w-lg p-0 gap-0">
            <DialogHeader className="border-b p-6 pb-3">
              <DialogTitle>Add Metadata</DialogTitle>
              <DialogDescription>
                Specify the name of the metadata and it&apos;s type.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto mb-16 p-6 pb-0">
              <MetadataSelectForm
                onSelectPreset={handleSelectPreset}
                form={metadataForm}
                onSubmit={addMetadata}
              >
                <div className="absolute w-full justify-end flex gap-2 bg-background rounded-b-md border-t bottom-0 right-0 p-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button disabled={isPending}>
                    {isPending && (
                      <Loader className="mr-2 size-4 animate-spin" />
                    )}
                    Add Metadata
                  </Button>
                </div>
              </MetadataSelectForm>
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
};

const dbToHumanRedable = {
  string: "Text",
  number: "Number",
  array: "List",
  image: "Image",
};

const MetadataField = ({
  field,
  onRemove,
}: {
  field: { _id: Id<"metadatas"> };
  onRemove: () => void;
}) => {
  const metadata = useQuery(api.products.getMetadataById, {
    metadataId: field._id,
  });

  if (metadata === undefined) return <div>Loading...</div>;
  if (metadata === null) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex flex-1">
        <Input
          className="-me-px rounded-e-none shadow-none focus-visible:z-10"
          type="text"
          value={metadata.name}
          readOnly
        />
        <div className="border border-inut rounded-e-lg px-3 flex justify-center items-center capitalize">
          {metadata.type}
        </div>
      </div>

      <Button type="button" variant="outline" size="icon" onClick={onRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );
};

interface MetadataSelectFormProps {
  form: UseFormReturn<MetadataSchema>;
  onSubmit: (data: MetadataSchema) => void;
  onSelectPreset: ({ _id }: { _id: Id<"metadatas"> }) => void;
  children: React.ReactNode;
}

function MetadataSelectForm({
  form,
  onSubmit,
  onSelectPreset,
  children,
}: MetadataSelectFormProps) {
  const presets = useQuery(api.products.getMetadatas);
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
                  placeholder="Metadata Name"
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
                    <option value="image">Image</option>
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
              onClick={() => onSelectPreset({ _id: p._id })}
            >
              <div>
                <h3>{p.name}</h3>
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

import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Minus, Plus } from "lucide-react";
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";

export const CreateCollectionSchema = z.object({
  name: z.string().min(1, { message: "Atleast one character is required" }),
});

export type CreateCollectionSchema = z.infer<typeof CreateCollectionSchema>;

interface CollectionFormProps {
  form: UseFormReturn<CreateCollectionSchema>;
  onSubmit: (data: CreateCollectionSchema) => void;
  onSelectPreset: (_id: Id<"collections">) => void;
  productCollection: {
    _id: Id<"collections">;
    name: string;
    description?: string;
    slug: string;
  }[];
  children: ReactNode;
  storeId: Id<"stores">;
  isSubmitting: boolean;
  onRemove: (_id: Id<"collections">) => void;
}

export function CollectionForm({
  form,
  onSubmit,
  onSelectPreset,
  productCollection,
  children,
  storeId,
  isSubmitting,
  onRemove,
}: CollectionFormProps) {
  const collections = useQuery(api.collections.getCollectionsByStoreId, {
    storeId,
  });
  const isPending = collections === undefined;

  function isInProductCollection(_id: Id<"collections">) {
    return productCollection.some((collection) => collection._id === _id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Collection</FormLabel>
              <div className="flex rounded-lg shadow-sm shadow-black/5">
                <Input
                  id="input-18"
                  className="-me-px shadow-none focus-visible:z-10 mr-2"
                  placeholder="Collection Name"
                  type="text"
                  disabled={isSubmitting}
                  {...field}
                />

                <Button disabled={isSubmitting}>Add Collection</Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <h5>Collections</h5>
          <ul className="border rounded-md">
            {isPending && (
              <div className="space-y-0.5">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-9 w-full rounded-none" />
                ))}
              </div>
            )}
            {!isPending && collections.length === 0 && (
              <div className="p-3 text-center text-muted-foreground">
                No collections found.
              </div>
            )}
            {collections?.map((p, index) => (
              <li
                key={index}
                className={cn(
                  "flex justify-between items-center py-2 px-3 hover:bg-muted cursor-pointer border-b text-foreground",
                  isInProductCollection(p._id) && "bg-muted"
                )}
                onClick={() =>
                  isInProductCollection(p._id)
                    ? onRemove(p._id)
                    : onSelectPreset(p._id)
                }
              >
                <h3>{p.name}</h3>
                {isInProductCollection(p._id) ? (
                  <Minus className="size-4 text-destructive" />
                ) : (
                  <Plus className="size-4 text-green-400" />
                )}
              </li>
            ))}
          </ul>
        </div>
        {children}
      </form>
    </Form>
  );
}

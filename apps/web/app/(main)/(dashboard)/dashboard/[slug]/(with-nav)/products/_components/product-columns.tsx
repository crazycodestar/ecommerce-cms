"use client";

import {
  CollectionForm,
  CreateCollectionSchema,
} from "@/components/form/collection-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/handle-error";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useMutation } from "convex/react";
import { formatRelative } from "date-fns";
import { Edit, Loader, MoreHorizontal, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
// import { ModerateStore, ModerateStoreProvider } from "./moderate-store";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  _id: Id<"products">;
  mainImage: string;
  name: string;
  price: number;
  collections: ({
    _id: Id<"collections">;
    name: string;
    description?: string;
    slug: string;
  } | null)[];
  storeId: Id<"stores">;
  createdAt: Date;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "mainImage",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("mainImage") as Product["mainImage"];
      return (
        <Image
          className="size-10 rounded-md object-cover"
          src={image}
          height={100}
          width={100}
          quality={100}
          alt="product image"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as Product["name"];
      return <p className="truncate max-w-[350px] font-semibold">{name}</p>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as Product["price"];
      return (
        <p>
          {price.toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "collections",
    header: "Collections",
    cell: ({ row }) => {
      const collections = row.getValue("collections") as Product["collections"];
      if (collections.length > 3) {
        return (
          <Badge variant="secondary">{collections.length} collections</Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {collections.map(
            (collection, index) =>
              collection && (
                <Badge key={index} variant="secondary">
                  {collection.name}
                </Badge>
              )
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const dateTime = row.getValue("createdAt") as Product["createdAt"];
      return <p className="truncate">{formatRelative(dateTime, new Date())}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowAction row={row} />,
  },
];

function RowAction({ row }: { row: Row<Product> }) {
  const product = row.original;

  const form = useForm<CreateCollectionSchema>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: { name: "" },
  });

  const [isPending, startTransition] = useTransition();
  const createCollection = useMutation(api.collections.createCollection);
  const addProductToCollection = useMutation(
    api.collections.addProductToCollection
  );
  const addCollection = (data: CreateCollectionSchema) => {
    startTransition(async () => {
      const { data: collectionId, error: createCollectionError } =
        await tryCatch(
          createCollection({
            name: data.name,
          })
        );

      if (createCollectionError) {
        console.error(createCollectionError);
        toast.error(createCollectionError.message);
        return;
      }

      const { error } = await tryCatch(
        addProductToCollection({
          productId: product._id,
          collectionId,
        })
      );

      if (error) {
        console.error(error);
        toast.error(error.message);
        return;
      }

      toast.success("Product added to collection");
      form.reset();
    });
  };

  const handleSelectPreset = (collectionId: Id<"collections">) => {
    startTransition(async () => {
      const { error } = await tryCatch(
        addProductToCollection({
          productId: product._id,
          collectionId,
        })
      );

      if (error) {
        showErrorToast(error);
        return;
      }

      toast.success("Product added to collection");
    });
  };

  const removeCollection = useMutation(
    api.collections.removeProductFromCollection
  );
  const handleRemoveCollection = (collectionId: Id<"collections">) => {
    startTransition(async () => {
      const { error } = await tryCatch(
        removeCollection({
          collectionId,
          productId: product._id,
        })
      );

      if (error) return void showErrorToast(error);

      return void toast.success("Product removed from collection");
    });
  };

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`./products/edit-product/${product._id}`}>
              <Pencil className="size-4" />
              Update Product
            </Link>
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Edit /> Edit Collection
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="flex flex-col sm:max-h-[min(640px,80vh)] sm:max-w-lg p-0 gap-0">
        <DialogHeader className="border-b p-6 pb-3">
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to associate with this product.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto mb-16 p-6 pb-0">
          <CollectionForm
            // @ts-expect-error null error
            productCollection={product.collections.filter(Boolean)}
            onSelectPreset={handleSelectPreset}
            isSubmitting={isPending}
            storeId={product.storeId}
            form={form}
            onSubmit={addCollection}
            onRemove={handleRemoveCollection}
          >
            <div className="absolute w-full justify-end flex gap-2 bg-background rounded-b-md border-t bottom-0 right-0 p-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild disabled={isPending}>
                <Button disabled={isPending}>
                  {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                  Done
                </Button>
              </DialogClose>
            </div>
          </CollectionForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}

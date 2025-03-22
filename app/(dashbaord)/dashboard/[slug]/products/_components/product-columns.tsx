"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataModel } from "@/convex/_generated/dataModel";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatRelative } from "date-fns";
import { MoreHorizontal, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { ModerateStore, ModerateStoreProvider } from "./moderate-store";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  _id: DataModel["products"]["document"]["_id"];
  mainImage: string;
  name: string;
  price: number;
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
          ₦
          {price
            .toLocaleString("en-US", { style: "currency", currency: "NGN" })
            .replace("NGN", "")}
        </p>
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

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

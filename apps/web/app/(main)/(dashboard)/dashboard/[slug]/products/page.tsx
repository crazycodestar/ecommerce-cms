"use client";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { columns, Product } from "./_components/product-columns";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const products = useQuery(api.products.getProductsByStoreSlug, { slug });

  const data = products
    ?.filter((p) => p !== undefined)
    .map(
      (p): Product => ({
        ...p,
        _id: p._id,
        createdAt: new Date(p._creationTime),
        // FIXME: use a specified mainImage
        mainImage: p.imageUrls[0]!,
        name: p.name,
        collections: p.collections,
      })
    );

  return (
    <div className="mx-auto container py-8">
      <div className="flex justify-between items-center">
        <Heading title="Products" description="These are all your products" />
        <Button asChild>
          <Link href={`./products/add-product`}>Add Product</Link>
        </Button>
      </div>
      {data ? <DataTable columns={columns} data={data} /> : <TableLoader />}
    </div>
  );
}

function TableLoader() {
  return (
    <div
      role="status"
      aria-label="Loading table data"
      className="animate-pulse"
    >
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 4 }).map((_, pos) => (
              <TableHead key={pos}>
                <Skeleton className="h-6 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 4 }).map((_, pos) => (
                <TableCell key={pos}>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <span className="sr-only">Loading table data...</span>
    </div>
  );
}

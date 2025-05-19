"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  Dialog,
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
import { Separator } from "@/components/ui/separator";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { OrderType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { formatRelative } from "date-fns";
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
// import { ModerateStore, ModerateStoreProvider } from "./moderate-store";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface Order extends OrderType {
  _id: Id<"orders">;
  _creationTime: number;
  slug: string;
}

export const columns: ColumnDef<Order>[] = [
  {
    id: "name",
    header: "Customer",
    cell: ({ row }) => {
      const {
        email,
        shippingInformation: { firstName, lastName },
      } = row.original;

      return (
        <div className="truncate max-w-[350px]">
          <p className="font-semibold">
            {firstName} {lastName}
          </p>
          <p className="truncate max-w-[350px]">{email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "items",
    cell: ({ row }) => {
      const items = row.getValue("items") as Order["items"];
      if (items.length > 3) {
        return <Badge variant="secondary">{items.length} items</Badge>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {items.map(
            (item, index) =>
              item && (
                <Badge key={index} variant="secondary">
                  {item.name}
                </Badge>
              )
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Order No",
    cell: ({ row }) => {
      const slug = row.getValue("slug") as Order["slug"];
      return <p className="truncate max-w-[350px] font-semibold">{slug}</p>;
    },
  },
  {
    id: "tracking",
    header: "Tracking",
    cell: ({ row }) => {
      const { terminalTrackingNumber, terminalTrackingUrl } = row.original;

      if (!terminalTrackingNumber || !terminalTrackingUrl) {
        return <Badge variant="outline">No tracking number</Badge>;
      }
      return (
        <Badge variant="outline" asChild>
          <Link target="_blank" href={terminalTrackingUrl}>
            {terminalTrackingNumber}
          </Link>
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const price = row.getValue("amount") as Order["amount"];
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
    accessorKey: "deliveryAmount",
    header: "Shipping",
    cell: ({ row }) => {
      const price = row.getValue("deliveryAmount") as Order["deliveryAmount"];
      return <p>{formatCurrency(price)}</p>;
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Created",
    cell: ({ row }) => {
      const dateTime = row.getValue("_creationTime") as Order["_creationTime"];
      return <p className="truncate">{formatRelative(dateTime, new Date())}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowAction row={row} />,
  },
];

function RowAction({ row }: { row: Row<Order> }) {
  const order = row.original;

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
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Eye /> View order details
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="flex flex-col sm:max-h-[min(640px,80vh)] sm:max-w-lg p-0 gap-0">
        <DialogHeader className="border-b p-6 pb-3">
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Choose a collection to associate with this product.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto mb-16 p-6 pb-0">
          <div>
            <div className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <CardTitle>{order.reference}</CardTitle>
                <Badge
                  variant={order.status === "success" ? "default" : "outline"}
                  className="w-fit"
                >
                  Payment Status{" "}
                  <Separator orientation="vertical" className="min-h-3" />
                  {order.status === "success" ? "Completed" : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="space-y-6">
              {/* <OrderTracker status={order.status} /> */}

              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {order.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span> +234
                    {order.phone}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {order.shippingInformation.firstName}{" "}
                    {order.shippingInformation.lastName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {order.shippingInformation.address1}
                    {order.shippingInformation.address2 &&
                      `, ${order.shippingInformation.address2}`}
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>{" "}
                    {order.shippingInformation.city}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zip Code:</span>{" "}
                    {order.shippingInformation.zipCode}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>

                      {item.variants && item.variants.length > 0 && (
                        <div className="text-sm mb-2">
                          <span className="text-muted-foreground">
                            Options:{" "}
                          </span>
                          {item.variants.map((variant, i) => (
                            <span key={i}>
                              {variant.name}: {variant.value}
                              {i < item.variants!.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.metadatas && item.metadatas.length > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Additional Info:{" "}
                          </span>
                          {item.metadatas.map((metadata, i) => (
                            <span key={i}>
                              {metadata.name}: {metadata.value}
                              {i < item.metadatas!.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.deliveryAmount)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {formatCurrency(order.amount + order.deliveryAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Heading } from "@/components/heading";
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
import { columns, Order } from "./_components/order-columns";

export default function ProductPage() {
  //   const { slug } = useParams<{ slug: string }>();
  const orders = useQuery(api.orders.getMyStoreOrders);

  const data = orders
    ?.filter((order) => order !== undefined)
    .map(
      (order): Order => ({
        ...order,
        amount: order.amount,
        deliveryAmount: order.shipping,
        email: order.email,
        items: order.items,
        phone: order.phone,
        reference: order.slug,
        shippingInformation: {
          address1: order.line1,
          address2: order.line2,
          city: order.city,
          firstName: order.firstName,
          lastName: order.lastName,
          zipCode: order.zip,
        },
        status: order.status as "pending" | "success",
      })
    );

  return (
    <div className="mx-auto container py-8">
      <div className="flex justify-between items-center">
        <Heading title="Orders" description="These are all your orders" />
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

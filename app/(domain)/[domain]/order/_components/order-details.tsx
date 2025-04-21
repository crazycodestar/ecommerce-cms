import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface OrderDetailsProps {
  order: OrderType;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
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
        </CardHeader>
        <CardContent className="space-y-6">
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
                      <span className="text-muted-foreground">Options: </span>
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
              <span>{formatCurrency(order.amount + order.deliveryAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

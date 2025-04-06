"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useCartStore, { useCart } from "@/hooks/use-cart-store";
import { Info, MinusCircle, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ShoppingBagPage() {
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { formattedProducts, isEmpty, isPending, subTotal } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Shopping Bag Content */}
          <div className="lg:w-2/3">
            {/* Shopping Bag Header */}
            <div className="mb-4">
              <h1 className="text-xl font-medium">
                Shopping Bag ({formattedProducts.length})
              </h1>
              <p className="text-sm text-gray-600">
                Items in your bag are not on hold.
              </p>
            </div>

            {/* Cart Item */}
            {isPending && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="rounded-md p-4 mb-6 h-48" />
                ))}
              </>
            )}
            {!isEmpty ? null : (
              <div className="border rounded-md flex flex-col justify-center items-center h-48">
                {/* <div className="px-4 py-3 rounded-sm bg-muted text-muted-foreground">
                  <Empty
                </div> */}
                <span>No Products in Cart</span>
                <Button variant="link" asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            )}
            {formattedProducts?.map(
              (item, index) =>
                item && (
                  <div
                    key={index}
                    className="border bg-white rounded-md p-4 mb-6"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Product Image */}
                      <div className="md:w-1/4 mb-4 md:mb-0">
                        <div className="aspect-[3/4] relative bg-gray-100">
                          <Image
                            src={
                              item.imageUrls[0] ??
                              "/placeholder.svg?height=300&width=225&text=Zella+Leggings"
                            }
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="md:w-2/4 md:px-4">
                        <h3 className="font-medium mb-1">{item.name}</h3>
                        <p className="text-sm mb-2">
                          {item.price.toLocaleString("en-NG", {
                            currency: "NGN",
                            style: "currency",
                          })}
                        </p>
                        {item.variants && (
                          <div className="text-sm text-gray-600 space-y-1 mb-4">
                            {item.variants.map((v, index) => (
                              <p key={index}>
                                {v.name}: {v.value}
                              </p>
                            ))}
                          </div>
                        )}

                        {item.metadatas && (
                          <div className="text-sm text-gray-600 space-y-1 mb-4">
                            {item.metadatas.map((v, index) => (
                              <p key={index}>
                                {v.name}: {v.value}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-4 items-center">
                          <div className="flex items-center">
                            <label htmlFor="quantity" className="text-sm mr-2">
                              Qty
                            </label>
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => decrementQuantity(index)}
                                className="rounded-full"
                                size="icon"
                                variant="ghost"
                              >
                                <MinusCircle className="size-4" />
                              </Button>
                              <span>
                                {item.quantity} {item.unit}
                              </span>
                              <Button
                                onClick={() => incrementQuantity(index)}
                                className="rounded-full"
                                size="icon"
                                variant="ghost"
                              >
                                <PlusCircle className="size-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex">
                            <button
                              onClick={() => removeItem(index)}
                              className="text-blue-600 cursor-pointer text-sm mr-4"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border rounded-md p-4 mb-6 sticky top-4">
              <h2 className="text-lg font-medium mb-4">Order summary</h2>

              <div className="flex items-start mb-4">
                <Info className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">
                    Delivery will be processed in the next step
                  </p>
                  <p className="text-gray-600">
                    Shipping information will be collected, and shipping cost
                    will be processed in the next step of the order process.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-3 border-t pt-2">
                {isPending &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[50px]" />
                    </div>
                  ))}
                {formattedProducts.map(
                  (product, index) =>
                    product && (
                      <div
                        key={index}
                        className="flex justify-between items-center w-full"
                      >
                        <h3 className="truncate lg:max-w-[150px]">
                          {product.name}
                        </h3>
                        <span className="font-normal ml-1 mr-auto">
                          x{product.quantity}
                        </span>
                        <p>
                          {product.price.toLocaleString("en-NG", {
                            currency: "NGN",
                            style: "currency",
                          })}
                        </p>
                      </div>
                    )
                )}
              </div>
              <div className="flex justify-between items-center mb-4 border-t pt-2">
                <span>Subtotal</span>
                {isPending ? (
                  <Skeleton className="h-6 w-[50px]" />
                ) : (
                  <span className="font-medium">
                    {isEmpty
                      ? (0).toLocaleString("en-NG", {
                          currency: "NGN",
                          style: "currency",
                        })
                      : subTotal.toLocaleString("en-NG", {
                          currency: "NGN",
                          style: "currency",
                        })}
                  </span>
                )}
              </div>

              <Button
                asChild={!isPending && !isEmpty}
                disabled={isPending || isEmpty}
                className="rounded-none w-full flex justify-center bg-black text-white py-5 font-medium mb-3"
              >
                <Link href="/shipping">Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

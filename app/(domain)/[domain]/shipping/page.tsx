"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import useCartStore, { useCart } from "@/lib/hooks/use-cart-store";
import { showErrorToast } from "@/lib/handle-error";
import { tryCatch } from "@/lib/try-catch";
import { useAction } from "convex/react";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function CheckoutPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const { formattedProducts, isEmpty, isPending, subTotal } = useCart();
  const router = useRouter();
  const [origin, setOrigin] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const initializePayment = useAction(api.paystack.initializeTransaction);
  async function handlePayment() {
    if (!origin) return;
    const callbackUrl = `${origin}/order`;

    const { data, error } = await tryCatch(
      initializePayment({
        email: "olamilekanadekanmbi@gmail.com",
        callbackUrl,
      })
    );

    if (error) showErrorToast(error);
    if (!data) return;

    clearCart();
    const { url } = data;
    router.push(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Checkout Content */}
          <div className="lg:w-2/3">
            {/* Delivery Address */}
            <div className="bg-white border rounded-md p-6 mb-6">
              <h2 className="text-lg font-medium">Delivery Address</h2>

              <p className="text-sm mb-6">
                Your order total includes product cost and shipping costs.
              </p>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address-line-1"
                    className="block text-sm mb-1"
                  >
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address-line-1"
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="address-line-2"
                    className="block text-sm mb-1"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="address-line-2"
                    className="w-full border rounded p-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postal-code" className="block text-sm mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="postal-code"
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    className="w-full border rounded p-2 bg-gray-100"
                    value="Nigeria"
                    readOnly
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">
                      Save this address for my next purchase.
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full border rounded p-2"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For order updates
                    </p>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="border rounded-l p-2 bg-gray-50 flex items-center">
                        <Image
                          src="/placeholder.svg?height=20&width=30&text=NG"
                          alt="Nigeria flag"
                          width={30}
                          height={20}
                          className="mr-1"
                        />
                        <span className="text-sm">(+234)</span>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full border border-l-0 rounded-r p-2"
                        placeholder="802 123 4567"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We need your phone number to assist delivery
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="cursor-pointer w-full bg-black text-white py-3 font-medium mt-4"
                  onClick={() => handlePayment()}
                >
                  Continue to payment
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border rounded-md mb-6 lg:sticky lg:top-4">
              <div className="p-4 bg-gray-100 border-b">
                <h2 className="text-lg font-medium">Cart Overview</h2>
              </div>

              <div className="p-4">
                <Link
                  href="/cart"
                  className="flex items-center text-sm text-blue-600 mb-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back To Cart
                </Link>

                {isPending && (
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex mb-6">
                        <Skeleton className="w-24 rounded-none h-24 mr-4" />
                        <div className="w-full">
                          <Skeleton className="h-6 w-[200px]" />
                          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                            <Skeleton className="w-[100px] h-4" />
                            <Skeleton className="ml-auto w-[20px] h-4" />
                            <Skeleton className="w-[70px] h-4" />
                            <Skeleton className="ml-auto w-[40px] h-4" />
                            <Skeleton className="w-[80px] h-4" />
                            <Skeleton className="ml-auto w-[30px] h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {isEmpty && (
                  <div className="w-full h-48 border rounded-md flex justify-center items-center">
                    Cart is Empty
                  </div>
                )}
                {formattedProducts.map(
                  (product, index) =>
                    product && (
                      <div key={index} className="flex mb-6">
                        <div className="w-20 shrink-0 h-24 bg-gray-100 relative mr-4">
                          <Image
                            src={
                              product.imageUrls[0] ??
                              "/placeholder.svg?height=96&width=80&text=Zella"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">
                            {product.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                            <div className="text-gray-600">Quantity:</div>
                            <div className="text-right">
                              {product.quantity} {product.unit}
                            </div>

                            {product.variants && (
                              <>
                                {product.variants.map((v, index) => (
                                  <React.Fragment key={index}>
                                    <div className="text-gray-600">
                                      {v.name}:
                                    </div>
                                    <div className="text-right">{v.value}</div>
                                  </React.Fragment>
                                ))}
                              </>
                            )}

                            {product.metadatas && (
                              <>
                                {product.metadatas.map((v, index) => (
                                  <React.Fragment key={index}>
                                    <div className="text-gray-600">
                                      {v.name}:
                                    </div>
                                    <div className="text-right truncate">
                                      {v.value}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </>
                            )}
                            <div className="text-gray-600">Price:</div>
                            <div className="text-right">
                              {product.price.toLocaleString("en-NG", {
                                currency: "NGN",
                                style: "currency",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                )}

                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Items</span>
                      <span>
                        {isPending ? (
                          <Skeleton className="h-6 w-[70px]" />
                        ) : (
                          subTotal.toLocaleString("en-NG", {
                            currency: "NGN",
                            style: "currency",
                          })
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery</span>
                      <span>USD50.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {isPending ? (
                        <Skeleton className="h-6 w-[70px]" />
                      ) : (
                        (subTotal + 50000).toLocaleString("en-NG", {
                          currency: "NGN",
                          style: "currency",
                        })
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <select className="border rounded p-2 text-sm">
                <option>English</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-gray-500">Powered by ESW</span>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/privacy">Privacy Statement</Link>
              <Link href="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

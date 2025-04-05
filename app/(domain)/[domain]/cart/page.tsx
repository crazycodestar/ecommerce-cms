"use client";

import useCartStore from "@/hooks/use-cart-store";
import { Check, Info } from "lucide-react";
import Image from "next/image";

export default function ShoppingBagPage() {
  const { items, incrementQuantity, decrementQuantity, removeItem } =
    useCartStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Shopping Bag Content */}
          <div className="lg:w-2/3">
            {/* Shopping Bag Header */}
            <div className="mb-4">
              <h1 className="text-xl font-medium">
                Shopping Bag ({items.length})
              </h1>
              <p className="text-sm text-gray-600">
                Items in your bag are not on hold.
              </p>
            </div>

            {/* Cart Item */}
            {items.map((item, index) => (
              <div key={index} className="border bg-white rounded-md p-4 mb-6">
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="md:w-1/4 mb-4 md:mb-0">
                    <div className="aspect-[3/4] relative bg-gray-100">
                      <Image
                        src="/placeholder.svg?height=300&width=225&text=Zella+Leggings"
                        alt="Zella Studio Luxe High Waist Pocket 7/8 Leggings"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="md:w-2/4 md:px-4">
                    <h3 className="font-medium mb-1">Zella</h3>
                    <p className="text-sm mb-2">
                      Studio Luxe High Waist Pocket 7/8 Leggings
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <p>Size: Small</p>
                      <p>Color: BLACK</p>
                      <p>Item: 7389593</p>
                    </div>

                    <div className="flex items-center mb-4">
                      <label htmlFor="quantity" className="text-sm mr-2">
                        Qty
                      </label>
                      <select
                        id="quantity"
                        className="border rounded p-1 text-sm w-16"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>

                    <div className="flex items-center text-sm mb-2">
                      <Check className="h-4 w-4 text-green-600 mr-1" />
                      <span>Free returns anytime</span>
                    </div>
                    <p className="text-xs text-gray-600">Sold by Nordstrom</p>

                    <div className="flex mt-4">
                      <button className="text-blue-600 text-sm mr-4">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

              <div className="flex justify-between items-center mb-4">
                <span>Subtotal</span>
                <span className="font-medium">$79.00</span>
              </div>

              <button className="w-full bg-black text-white py-3 font-medium mb-3">
                Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

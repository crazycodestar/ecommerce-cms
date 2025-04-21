"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { showErrorToast } from "@/lib/handle-error";
import useCartStore, { useCart } from "@/lib/hooks/use-cart-store";
import { useStoreSlug } from "@/lib/hooks/use-store-slug";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { ChevronLeft, Loader, TruckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type ShipmentRates = (typeof api.terminal.getRatesForShipment)["_returnType"];

const shippingFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    line1: z.string().min(1, "Address is required"),
    line2: z.string().optional(),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    zip: z.string().min(1, "Zip code is required"),
    country: z.string().default("Nigeria"),
    email: z.string().email("Invalid email address"),
    rateId: z.string().min(1, { message: "Please select a shipment option" }),
    terminalAddressId: z.string(),
    terminalParcelId: z.string(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
    saveAddress: z.boolean().default(false),
  })
  .refine(
    (args) => args.rateId && args.terminalAddressId && args.terminalParcelId,
    {
      message: "Please select a shipment option",
      path: ["rateId"],
    }
  );
type ShippingFormSchema = z.infer<typeof shippingFormSchema>;

const useStates = () => {
  const [states, setStates] = React.useState<
    { name: string; countryCode: string; isoCode: string }[]
  >([]);
  const getStates = useAction(api.terminal.getStates);

  React.useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await tryCatch(getStates());
      if (error) return toast.error("Failed to fetch states");
      setStates(data);
    };

    fetchStates();
  }, []);

  return states;
};

const useCities = (stateCode?: string) => {
  const [cities, setCities] = React.useState<
    { name: string; stateCode: string; countryCode: string }[]
  >([]);
  const getCities = useAction(api.terminal.getCities);

  React.useEffect(() => {
    if (!stateCode) return;

    const fetchCities = async () => {
      const { data, error } = await tryCatch(getCities({ stateCode }));
      if (error) return toast.error("Failed to fetch cities");
      setCities(data);
    };

    fetchCities();
  }, [stateCode]);

  return cities;
};

export default function CheckoutPage() {
  const { storeSlug } = useStoreSlug();
  const clearCart = useCartStore((state) => state.clearCart);
  const { formattedProducts, isEmpty, isPending, subTotal } = useCart();
  const router = useRouter();
  const [origin, setOrigin] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const initializeOrder = useAction(api.orders.initializeOrder);
  const [isOrderProcessing, startTransition] = React.useTransition();
  async function onSubmit(values: ShippingFormSchema) {
    if (!origin || !storeSlug || !selectedRate) return;
    const callbackUrl = `${origin}/order`;

    startTransition(async () => {
      const { data, error } = await tryCatch(
        initializeOrder({
          callbackUrl,
          city: values.city,
          country: values.country,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          line1: values.line1,
          line2: values.line2,
          phone: values.phone,
          rateId: values.rateId,
          state: values.state,
          storeSlug,
          zip: values.zip,
          items: formattedProducts.map((p) => ({
            productId: p._id,
            quantity: p.quantity,
            metadatas: p.metadatas,
            variants: p.variants,
          })),
          shipping: selectedRate.amount,
          terminalAddressId: values.terminalAddressId,
          terminalParcelId: values.terminalParcelId,
        })
      );

      if (error) showErrorToast(error);
      if (!data) return;

      clearCart();
      const { url } = data;
      router.push(url);
    });
  }

  const {
    formState: { errors },
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<ShippingFormSchema>({
    resolver: zodResolver(shippingFormSchema),
    // defaultValues: {
    //   firstName: "",
    //   lastName: "",
    //   line1: "",
    //   line2: "",
    //   city: "",
    //   state: "",
    //   zip: "",
    //   country: "NG",
    //   email: "",
    //   phone: "",
    //   rateId: "",
    //   saveAddress: false,
    // },
    defaultValues: {
      firstName: "Olalekan",
      lastName: "Adekanmbi",
      line1: "No. 3 Ayooluwole drive, Akobo",
      line2: "",
      city: "Ibadan",
      state: "Oyo",
      zip: "200002",
      country: "NG",
      email: "olamilekanadekanmbi@gmail.com",
      phone: "9034864767",
      rateId: "",
      saveAddress: false,
    },
  });

  const getRatesForShipment = useAction(api.terminal.getRatesForShipment);
  const [canGetShipmentRates, setCanGetShipmpentRates] = React.useState(false);
  const [shipmentRates, setShipmentRates] = React.useState<ShipmentRates>([]);

  const getDeliveryAddressFormat = () => ({
    country: "NG",
    state: watch("state"),
    city: watch("city"),
    email: watch("email"),
    line1: watch("line1"),
    firstName: watch("firstName"),
    lastName: watch("lastName"),
    phone: watch("phone") ? `+234${watch("phone")}` : "",
    zip: watch("zip"),
  });

  React.useEffect(() => {
    if (!storeSlug) return setCanGetShipmpentRates(false);
    if (!formattedProducts.length) return setCanGetShipmpentRates(false);

    const hasAllRequirements = Object.values(getDeliveryAddressFormat()).every(
      Boolean
    );
    setCanGetShipmpentRates(hasAllRequirements);
  }, [storeSlug, getDeliveryAddressFormat(), formattedProducts]);

  const getShipmentRates = async () => {
    if (!storeSlug) return;
    if (!formattedProducts.length) return;

    const { data, error } = await tryCatch(
      getRatesForShipment({
        deliveryAddress: getDeliveryAddressFormat(),
        items: formattedProducts
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => ({
            productId: p._id,
            quantity: p.quantity,
            name: p.name,
            description: p.additionalInformation?.slice(0, 100) ?? "",
            value: p.price,
            weight: p.weight,
          })),
        storeSlug,
      })
    );
    if (error) return toast.error("Failed to fetch rates");
    setShipmentRates(data);
  };

  // async function onSubmit(values: ShippingFormSchema) {
  //   console.log("values: ", values);
  // }

  const states = useStates();
  const getStateCode = (state: string) =>
    states.find((s) => s.name === state)?.isoCode;
  const cities = useCities(getStateCode(watch("state")) || undefined);

  const selectedRate = shipmentRates.find(
    (rate) => rate.rate_id === watch("rateId")
  );

  const [isOpen, setOpen] = React.useState(false);
  const handleSelectRate = (rate: ShipmentRates[number]) => {
    setValue("rateId", rate.rate_id);
    setValue("terminalAddressId", rate.delivery_address);
    setValue("terminalParcelId", rate.parcel);
    setOpen(false);
  };

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

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      type="text"
                      id="firstName"
                      className="w-full border rounded p-2"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      type="text"
                      id="lastName"
                      className="w-full border rounded p-2"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="addressLine1" className="block text-sm mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("line1", {
                      required: "Address is required",
                    })}
                    type="text"
                    id="line1"
                    className="w-full border rounded p-2"
                  />
                  {errors.line1 && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.line1.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="line2" className="block text-sm mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    {...register("line2")}
                    type="text"
                    id="line2"
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("country")}
                    id="country"
                    className="w-full border rounded p-2"
                    // disabled
                  >
                    <option value="NG">Nigeria</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("state", {
                        required: "State is required",
                      })}
                      onChange={(e) => {
                        setValue("state", e.currentTarget.value);
                        setValue("city", "");
                      }}
                      id="state"
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select State</option>
                      {states.map((option) => (
                        <option key={option.isoCode} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled={!watch("state")}
                      {...register("city", { required: "City is required" })}
                      id="city"
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select City</option>
                      {cities.map((option) => (
                        <option key={option.name} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                      {/* Add more cities as needed */}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="addressLine2" className="block text-sm mb-1">
                    Zip Code
                  </label>
                  <input
                    {...register("zip")}
                    type="number"
                    min={0}
                    id="zip"
                    className="w-full border rounded p-2"
                  />
                  {errors.zip && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.zip.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register("saveAddress")}
                      className="mr-2"
                    />
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
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      id="email"
                      className="w-full border rounded p-2"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
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
                        <span className="text-sm">(+234)</span>
                      </div>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Please enter a valid 10-digit phone number",
                          },
                        })}
                        type="tel"
                        id="phone"
                        className="w-full border border-l-0 rounded-r p-2"
                        placeholder="802 123 4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      We need your phone number to assist delivery
                    </p>
                  </div>
                </div>

                <div>
                  <Dialog open={isOpen} onOpenChange={setOpen}>
                    <div
                      className="w-full cursor-pointer"
                      onClick={() =>
                        canGetShipmentRates ? setOpen(true) : undefined
                      }
                    >
                      {selectedRate ? (
                        <div className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {selectedRate.carrier_logo && (
                                <img
                                  src={selectedRate.carrier_logo}
                                  alt={selectedRate.carrier_name}
                                  className="h-8 w-8 object-contain"
                                />
                              )}
                              <h4 className="font-medium">
                                {selectedRate.carrier_name}
                              </h4>
                            </div>
                            <div className="font-medium">
                              {selectedRate.amount.toLocaleString("en-NG", {
                                style: "currency",
                                currency: selectedRate.currency,
                              })}
                            </div>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-600">
                              {selectedRate.carrier_rate_description}
                            </p>
                            <div className="flex gap-x-4">
                              <span className="text-gray-500">
                                Delivery: {selectedRate.delivery_time}
                              </span>
                              <span className="text-gray-500">
                                Pickup: {selectedRate.pickup_time}
                              </span>
                            </div>
                            {selectedRate.metadata.recommended && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={
                            canGetShipmentRates ? getShipmentRates : undefined
                          }
                          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center
                                ${
                                  canGetShipmentRates
                                    ? "hover:border-blue-500 cursor-pointer"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                        >
                          <div className="bg-blue-100 p-4 rounded-md">
                            <TruckIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Choose Shipping Method
                            </p>

                            {errors.rateId && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.rateId.message}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              {canGetShipmentRates
                                ? "Click to view available shipping options"
                                : "Please complete your delivery information"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Shipping Method</DialogTitle>
                        <DialogDescription>
                          Choose your preferred shipping option
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-auto">
                        {shipmentRates.map((rate, index) => (
                          <div
                            key={index}
                            className="flex flex-col p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectRate(rate)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {rate.carrier_logo && (
                                  <img
                                    src={rate.carrier_logo}
                                    alt={rate.carrier_name}
                                    className="h-8 w-8 object-contain"
                                  />
                                )}
                                <h4 className="font-medium">
                                  {rate.carrier_name}
                                </h4>
                              </div>
                              <div className="font-medium">
                                {rate.amount.toLocaleString("en-NG", {
                                  style: "currency",
                                  currency: rate.currency,
                                })}
                              </div>
                            </div>

                            <div className="text-sm space-y-1">
                              <p className="text-gray-600">
                                {rate.carrier_rate_description}
                              </p>
                              <div className="flex gap-x-4">
                                <span className="text-gray-500">
                                  Delivery: {rate.delivery_time}
                                </span>
                                <span className="text-gray-500">
                                  Pickup: {rate.pickup_time}
                                </span>
                              </div>
                              {rate.metadata.recommended && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  Recommended
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* <pre>{JSON.stringify(shipmentRates, null, 2)}</pre> */}

                <button
                  type="submit"
                  disabled={
                    isPending || !canGetShipmentRates || isOrderProcessing
                  }
                  className="flex gap-2 items-center justify-center cursor-pointer w-full bg-black text-white py-3 font-medium mt-4 disabled:opacity-50"
                >
                  {isOrderProcessing && (
                    <Loader className="size-4 animate-spin" />
                  )}
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
                      <span>
                        {selectedRate
                          ? selectedRate.amount.toLocaleString("en-NG", {
                              currency: "NGN",
                              style: "currency",
                            })
                          : "Select Delivery option"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {isPending ? (
                        <Skeleton className="h-6 w-[70px]" />
                      ) : (
                        (subTotal + (selectedRate?.amount ?? 0)).toLocaleString(
                          "en-NG",
                          {
                            currency: "NGN",
                            style: "currency",
                          }
                        )
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

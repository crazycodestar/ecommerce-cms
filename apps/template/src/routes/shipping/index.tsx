import { deliveryAPI, ordersAPI, terminalAPI } from "@/api";
import type { GetDeliveryInfoResponse } from "@/api/returnTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useCartStore, { useCart } from "@/hooks/use-cart-store";
import { useStoreSlug } from "@/hooks/use-store-slug";
import { showErrorToast } from "@/lib/handle-error";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Loader, TruckIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/shipping/")({
  component: RouteComponent,
});

type ShipmentRate = {
  rate_id: string;
  amount: number;
  delivery_address: string;
  parcel: string;
  carrier_logo: string;
  carrier_name: string;
  currency: string;
  carrier_rate_description: string;
  delivery_time: string;
  pickup_time: string;
  metadata: {
    recommended?: string | boolean;
    [key: string]: unknown;
  };
};

const shippingFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  terminalInfo: z.optional(z.object({
    rateId: z.string().min(1, "Please select a shipping rate"),
    terminalAddressId: z.string().min(1, "Address ID is required"),
    terminalParcelId: z.string().min(1, "Parcel ID is required"),
  })),
  customDeliveryInfo: z.optional(z.object({
    selectedOffering: z.string().min(1, "Please select a shipping option"),
  })),
  saveAddress: z.boolean(),
});

type ShippingFormSchema = z.infer<typeof shippingFormSchema>;

const useStates = () => {
  const [states, setStates] = React.useState<
    { name: string; countryCode: string; isoCode: string }[]
  >([]);

  React.useEffect(() => {
    const fetchStates = async () => {
      const { data, error } = await tryCatch(terminalAPI.getStates());
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

  React.useEffect(() => {
    if (!stateCode) return;

    const fetchCities = async () => {
      const { data, error } = await tryCatch(terminalAPI.getCities(stateCode));
      if (error) return toast.error("Failed to fetch cities");
      setCities(data);
    };

    fetchCities();
  }, [stateCode]);

  return cities;
};

function RouteComponent() {
  const { storeSlug } = useStoreSlug();
  const clearCart = useCartStore((state) => state.clearCart);
  const { formattedProducts, isEmpty, isPending, subTotal } = useCart();
  const [origin, setOrigin] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const [isOrderProcessing, startTransition] = React.useTransition();
  const [deliveryInfo, setDeliveryInfo] = React.useState<GetDeliveryInfoResponse | null>(null);

  React.useEffect(() => {
    const fetchDeliveryInfo = async () => {
      const { data, error } = await tryCatch(deliveryAPI.getInfo(storeSlug));
      if (error) return toast.error("Failed to fetch delivery info");
      setDeliveryInfo(data);
    };

    fetchDeliveryInfo();
  }, []);

  async function onSubmit(values: ShippingFormSchema) {
    if (!origin || !storeSlug || !selectedRate) return;
    const callbackUrl = `${origin}/order`;

    startTransition(async () => {
      const { data, error } = await tryCatch(
        ordersAPI.initialize({
          callbackUrl,
          city: values.city,
          country: values.country,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          line1: values.line1,
          line2: values.line2,
          phone: values.phone,
          state: values.state,
          storeSlug,
          zip: values.zip,
          items: formattedProducts.map((p) => ({
            productId: p._id,
            quantity: p.quantity,
            metadatas: p.metadatas,
            variants: p.variants,
          })),

          terminalInfo: values.terminalInfo ? {
            terminalAddressId: values.terminalInfo.terminalAddressId,
            terminalParcelId: values.terminalInfo.terminalParcelId,
            rateId: values.terminalInfo.rateId,
          } : undefined,

          customDeliveryInfo: values.customDeliveryInfo ? {
            selectedOffering: values.customDeliveryInfo.selectedOffering,
          } : undefined,

          shipping: selectedRate.amount,
        })
      );

      if (error) showErrorToast(error);
      if (!data) return;

      clearCart();
      window.location.href = data.url;
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
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "Lagos",
      state: "Lagos",
      zip: "10001",
      country: "NG",
      email: "johndoe@example.com",
      phone: "1234567890",
      saveAddress: false,
      terminalInfo: deliveryInfo?.deliveryType === 'terminal' ? {
        rateId: "",
        terminalAddressId: "",
        terminalParcelId: ""
      } : undefined,
      customDeliveryInfo: deliveryInfo?.deliveryType === 'custom' ? {
        selectedOffering: ""
      } : undefined,
    },
  });

  const [canGetShipmentRates, setCanGetShipmpentRates] = React.useState(false);
  const [shipmentRates, setShipmentRates] = React.useState<ShipmentRate[]>([]);

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
    if (deliveryInfo?.deliveryType !== 'terminal') return setCanGetShipmpentRates(false);

    const hasAllRequirements = Object.values(getDeliveryAddressFormat()).every(
      Boolean
    );
    setCanGetShipmpentRates(hasAllRequirements);
  }, [storeSlug, getDeliveryAddressFormat(), formattedProducts, deliveryInfo]);

  const getShipmentRates = async () => {
    if (!storeSlug) return;
    if (!formattedProducts.length) return;
    if (deliveryInfo?.deliveryType !== 'terminal') return;

    const { data, error } = await tryCatch(
      terminalAPI.getRates(
        storeSlug,
        getDeliveryAddressFormat(),
        formattedProducts
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => ({
            productId: p._id,
            quantity: p.quantity,
            name: p.name,
            description: p.additionalInformation?.slice(0, 100) ?? "",
            value: p.price,
            weight: p.terminal!.weight,
          }))
      )
    );
    if (error) {
      console.error(error);
      return toast.error("Failed to fetch rates");
    }

    // Convert recommended field to boolean if it's a string
    const rates = data.map((rate: ShipmentRate) => ({
      ...rate,
      metadata: {
        ...rate.metadata,
        recommended:
          rate.metadata.recommended === "true" ||
          rate.metadata.recommended === true,
      },
    }));

    setShipmentRates(rates);
  };

  const states = useStates();
  const getStateCode = (state: string) =>
    states.find((s) => s.name === state)?.isoCode;
  const cities = useCities(getStateCode(watch("state")) || undefined);

  const selectedRate = shipmentRates.find(
    (rate) => rate.rate_id === watch("terminalInfo.rateId")
  );

  const [isOpen, setOpen] = React.useState(false);
  const handleSelectRate = (rate: ShipmentRate) => {
    setValue("terminalInfo.rateId", rate.rate_id);
    setValue("terminalInfo.terminalAddressId", rate.delivery_address);
    setValue("terminalInfo.terminalParcelId", rate.parcel);
    setOpen(false);
  };

  const getDeliveryPrice = () => {
    if (selectedRate) {
      return selectedRate.amount;
    }
    if (deliveryInfo?.deliveryType === 'custom') {
      const selectedOffering = deliveryInfo.offerings.find(
        o => o.name === watch('customDeliveryInfo.selectedOffering')
      );
      return selectedOffering?.price ?? 0;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Checkout Content */}
          <div className="lg:w-2/3">
            {/* Delivery Address */}
            <div className="bg-white border  p-6 mb-6">
              <h2 className="text-lg font-normal">Delivery Address</h2>
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
                      <div className="border  p-2 bg-gray-50 flex items-center">
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
                        className="w-full border border-l-0  p-2"
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
                  {deliveryInfo?.deliveryType === 'terminal' ? 
                    <Dialog open={isOpen} onOpenChange={setOpen}>
                      <div
                        className="w-full cursor-pointer"
                        onClick={() =>
                          canGetShipmentRates ? setOpen(true) : undefined
                        }
                      >
                        {selectedRate ? (
                          <div className="border  p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {selectedRate.carrier_logo && (
                                  <img
                                    src={selectedRate.carrier_logo}
                                    alt={selectedRate.carrier_name}
                                    className="h-8 w-8 object-contain"
                                  />
                                )}
                                <h4 className="font-normal">
                                  {selectedRate.carrier_name}
                                </h4>
                              </div>
                              <div className="font-normal">
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
                            className={`border-2 border-dashed  p-6 flex flex-col items-center justify-center gap-4 text-center
                                  ${
                                    canGetShipmentRates
                                      ? "hover:border-blue-500 cursor-pointer"
                                      : "opacity-50 cursor-not-allowed"
                                  }`}
                          >
                            <div className="bg-blue-100 p-4 ">
                              <TruckIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-normal">
                                Choose Shipping Method
                              </p>

                              {errors.terminalInfo?.rateId && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.terminalInfo.rateId.message}
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
                              className="flex flex-col p-4 border  hover:bg-gray-50 cursor-pointer"
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
                                  <h4 className="font-normal">
                                    {rate.carrier_name}
                                  </h4>
                                </div>
                                <div className="font-normal">
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
                    </Dialog> : 
                    
                      <div className="space-y-4">
                        <h3 className="font-normal text-sm">Select Delivery Option</h3>
                        {errors.customDeliveryInfo?.selectedOffering && (
                          <p className="text-red-500 text-xs">
                            {errors.customDeliveryInfo.selectedOffering.message}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          {deliveryInfo?.offerings.map((offering) => (
                            <label
                              key={offering.name}
                              className={`flex items-center justify-between p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                                watch('customDeliveryInfo.selectedOffering') === offering.name
                                  ? 'border-blue-500 bg-blue-50'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  value={offering.name}
                                  {...register('customDeliveryInfo.selectedOffering')}
                                  className="size-4"
                                />
                                <span>{offering.name}</span>
                              </div>
                              <span className="font-normal">
                                {offering.price.toLocaleString('en-NG', {
                                  style: 'currency',
                                  currency: 'NGN'
                                })}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                  }
                </div>
                {/* <pre>{JSON.stringify(shipmentRates, null, 2)}</pre> */}

                <button
                  type="submit"
                  disabled={
                    isPending || !canGetShipmentRates || isOrderProcessing
                  }
                  className="flex gap-2 items-center justify-center cursor-pointer w-full bg-black text-white py-3 font-normal mt-4 disabled:opacity-50"
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
            <div className="bg-white border  mb-6 lg:sticky lg:top-4">
              <div className="p-4 bg-gray-100 border-b">
                <h2 className="text-lg font-normal">Cart Overview</h2>
              </div>

              <div className="p-4">
                <Link
                  to="/cart"
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
                  <div className="w-full h-48 border  flex justify-center items-center">
                    Cart is Empty
                  </div>
                )}
                {formattedProducts.map(
                  (product, index) =>
                    product && (
                      <div key={index} className="flex mb-6">
                        <div className="w-20 shrink-0 h-24 bg-gray-100 relative mr-4">
                          <img
                            src={
                              product.imageUrls[0] ??
                              "/placeholder.svg?height=96&width=80&text=Zella"
                            }
                            alt={product.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-normal text-sm">
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
                        {getDeliveryPrice().toLocaleString("en-NG", {
                          currency: "NGN",
                          style: "currency",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between font-normal pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {isPending ? (
                        <Skeleton className="h-6 w-[70px]" />
                      ) : (
                        (subTotal + getDeliveryPrice()).toLocaleString(
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
              <Link to="/">Terms & Conditions</Link>
              <Link to="/">Privacy Statement</Link>
              <Link to="/">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

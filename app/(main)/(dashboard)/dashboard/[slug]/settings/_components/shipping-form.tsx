"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
// import {} from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FormSelect,
  FormSelectContent,
  FormSelectItem,
  FormSelectTrigger,
  FormSelectValue,
} from "@/components/form/form-select";
import { Loader, SquareArrowOutUpRight } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "@/components/phone-input";
import React from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { tryCatch } from "@/convex/utils";

const shippingAddressSchema = z.object({
  terminalSecretKey: z
    .string()
    .min(2, { message: "Terminal Secret Key is Required" }),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  line1: z.string().min(5, { message: "Address line 1 is required." }),
  line2: z.string().optional(),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  country: z.string().min(2, { message: "Country is required." }),
});

type ShippingAddressValues = z.infer<typeof shippingAddressSchema>;

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

export function ShippingForm({
  defaultValues,
  slug,
}: {
  defaultValues: Partial<ShippingAddressValues>;
  slug: string;
}) {
  const form = useForm<ShippingAddressValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues,
    mode: "onChange",
  });

  const states = useStates();
  const cities = useCities(form.watch("state") || undefined);

  const [isPending, startTransition] = React.useTransition();
  const updateStore = useMutation(api.stores.updateStore);
  async function onSubmit(data: ShippingAddressValues) {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateStore({
          ...data,
          slug,
        })
      );

      if (error)
        return void toast.error("Failed to update store. Try again later");
      toast.success("Profile updated.");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="terminalSecretKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terminal Secret Key</FormLabel>
                <FormDescription>
                  We manage shipping, and delivery using terminal Africa.{" "}
                  <Link
                    className="text-blue-500 hover:underline inline-flex gap-1 items-center"
                    href="https://www.terminal.africa/"
                    target="_blank"
                  >
                    Manage Account
                    <SquareArrowOutUpRight className="size-3" />
                  </Link>
                </FormDescription>
                <FormControl>
                  <Input placeholder="sk_live_b21d..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <h2 className="text-xl font-semibold">Shipping Address</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <RPNInput.default
                    className="flex rounded-md shadow-xs"
                    international
                    flagComponent={FlagComponent}
                    countrySelectComponent={CountrySelect}
                    inputComponent={PhoneInput}
                    placeholder="Enter phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input placeholder="Apt 4B" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormSelect control={form.control} name="country" label="Country">
              <FormSelectTrigger className="w-full">
                <FormSelectValue placeholder="Select country" />
              </FormSelectTrigger>
              <FormSelectContent>
                <FormSelectItem value="NG">Nigeria</FormSelectItem>
              </FormSelectContent>
            </FormSelect>
            <FormSelect control={form.control} name="state" label="State">
              <FormSelectTrigger
                disabled={!form.watch("country")}
                className="w-full"
              >
                <FormSelectValue placeholder="Select state" />
              </FormSelectTrigger>
              <FormSelectContent>
                {states.map((state) => (
                  <FormSelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </FormSelectItem>
                ))}
              </FormSelectContent>
            </FormSelect>
            <FormSelect control={form.control} name="city" label="City">
              <FormSelectTrigger
                disabled={!form.watch("state")}
                className="w-full"
              >
                <FormSelectValue placeholder="Select city" />
              </FormSelectTrigger>
              <FormSelectContent>
                {cities.map((city) => (
                  <FormSelectItem key={city.name} value={city.name}>
                    {city.name}
                  </FormSelectItem>
                ))}
              </FormSelectContent>
            </FormSelect>
          </div>
        </div>
        <Button disabled={isPending} type="submit">
          {isPending && <Loader className="size-4 animate-spin" />} Update
          Shipping
        </Button>
      </form>
    </Form>
  );
}

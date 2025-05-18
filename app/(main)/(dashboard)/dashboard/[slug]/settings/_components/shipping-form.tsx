"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { tryCatch } from "@/convex/utils";
import { useMutation } from "convex/react";
import React from "react";
import {
    FormSelect,
    FormSelectContent,
    FormSelectItem,
    FormSelectTrigger,
    FormSelectValue,
} from "@/components/form/form-select";
import {
    CountrySelect,
    FlagComponent,
    PhoneInput,
} from "@/components/phone-input";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAction } from "convex/react";
import { SquareArrowOutUpRight } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import Link from "next/link";

export const terminalAddressSchema = z.object({
    deliveryType: z.literal("terminal"),
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
    zip: z.string().min(2, { message: "Zip is required" }),
    city: z.string().min(2, { message: "City is required." }),
    state: z.string().min(2, { message: "State is required." }),
    country: z.string().min(2, { message: "Country is required." }),
});

export type TerminalAddressValues = z.infer<typeof terminalAddressSchema>;

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
    }, [getStates]);

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
    }, [stateCode, getCities]);

    return cities;
};

const customDeliverySchema = z.object({
    deliveryType: z.literal("custom"),
    offerings: z.array(
        z.object({
            name: z.string().min(1, { message: "Name is required" }),
            price: z.number().min(1, { message: "Price must be greater than 0" }),
        })
    ),
});

const shippingInfoSchema = z.discriminatedUnion("deliveryType", [
    customDeliverySchema,
    terminalAddressSchema
]);

type ShippingInfoValues = z.infer<typeof shippingInfoSchema>;

export function ShippingForm({ defaultValues, slug }: { defaultValues: Partial<ShippingInfoValues>, slug: string }) {
    const [deliveryType, setDeliveryType] = React.useState<"custom" | "terminal">(defaultValues.deliveryType || "custom");
    const [isPending, startTransition] = React.useTransition();
    const updateStore = useMutation(api.stores.updateStore);

    const form = useForm<ShippingInfoValues>({
        resolver: zodResolver(shippingInfoSchema),
        defaultValues: defaultValues,
        mode: "onChange"
    });

    const handleDeliveryTypeChange = (newType: "custom" | "terminal") => {
        setDeliveryType(newType);

        if (newType === defaultValues.deliveryType) {
            form.reset(defaultValues);
        } else if (newType === "terminal") {
            form.reset({
                deliveryType: "terminal",
                terminalSecretKey: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                line1: "",
                line2: "",
                zip: "",
                city: "",
                state: "",
                country: "",
            });
        } else {
            form.reset({
                deliveryType: "custom",
                offerings: [{ name: "", price: 0 }],
            });
        }
    };

    async function onSubmit(data: ShippingInfoValues) {
        startTransition(async () => {
            const { error } = await tryCatch(
                updateStore({
                    deliveryInfo: data,
                    slug,
                })
            );

            if (error) return void toast.error("Failed to update store.");
            toast.success("Shipping info updated.");
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant={deliveryType === "terminal" ? "default" : "outline"}
                    onClick={() => handleDeliveryTypeChange("terminal")}
                >
                    Terminal Africa
                </Button>
                <Button
                    type="button"
                    variant={deliveryType === "custom" ? "default" : "outline"}
                    onClick={() => handleDeliveryTypeChange("custom")}
                >
                    Custom Delivery
                </Button>
            </div>


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {deliveryType === "terminal" ? (
                        <TerminalForm form={form} slug={slug} />
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm">
                                        Add your own delivery offerings and their prices
                                    </p>
                                </div>

                                {form.watch("offerings")?.map((_, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Offering name (e.g. Standard Delivery)"
                                            {...form.register(`offerings.${index}.name`)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price (₦)"
                                            {...form.register(`offerings.${index}.price`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <button
                                            type="button"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => {
                                                const newOfferings = form.getValues("offerings").filter(
                                                    (_, i) => i !== index
                                                );
                                                form.setValue("offerings", newOfferings);
                                            }}
                                        >
                                            <Trash2 className="size-4 cursor-pointer" />
                                        </button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const currentOfferings = form.getValues("offerings") || [];
                                        form.setValue("offerings", [
                                            ...currentOfferings,
                                            { name: "", price: 0 },
                                        ]);
                                    }}
                                >
                                    Add Offering
                                </Button>
                            </div>

                            <Button disabled={isPending} type="submit">
                                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                                Update Shipping
                            </Button>
                        </>
                    )}
                </form>
            </Form>
        </div>
    );
}


export function TerminalForm({
    form,
    slug,
}: {
    form: UseFormReturn<ShippingInfoValues>;
    slug: string;
}) {

    const states = useStates();
    const getStateCode = (state: string) =>
        states.find((s) => s.name === state)?.isoCode;
    const cities = useCities(getStateCode(form.watch("state")) || undefined);

    const [isPending, startTransition] = React.useTransition();
    const updateStore = useMutation(api.stores.updateStore);
    async function onSubmit(data: TerminalAddressValues) {
        startTransition(async () => {
            const { error } = await tryCatch(
                updateStore({
                    ...data,
                    slug,
                })
            );

            if (error)
                return void toast.error("Failed to update store. Try again later");
            toast.success("Shipping info updated.");
        });
    }

    return (
        <>
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

                <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zip code</FormLabel>
                            <FormControl>
                                <Input placeholder="100001" {...field} />
                            </FormControl>
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
                    <FormField
                        control={form.control}
                        name={"state"}
                        render={({ field }) => (
                            <FormItem className="grid w-full">
                                <FormLabel>State</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue("city", "");
                                    }}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger
                                            disabled={!form.watch("country")}
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                        {states.map((state) => (
                                            <SelectItem key={state.isoCode} value={state.name}>
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
        </>
    );
}
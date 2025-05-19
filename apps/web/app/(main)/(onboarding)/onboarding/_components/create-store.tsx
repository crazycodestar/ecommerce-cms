"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { tryCatch } from "@/lib/try-catch";

import { Button } from "@/components/ui/button";

import { slugify } from "@/lib/slugify";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader,
  SquareArrowOutUpRight,
  Trash2,
} from "lucide-react";

import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@packages/backend/convex/_generated/api";
import { showErrorToast } from "@/lib/handle-error";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useAction } from "convex/react";
import { omit } from "es-toolkit";
import Link from "next/link";

const deliveryInfoSchema = z.object({
  deliveryOptions: z.array(
    z.object({
      name: z.string().min(1, { message: "Name is required" }),
      price: z.number().min(1, { message: "Price must be greater than 0" }),
    })
  ),
});

const storeInfoSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(3, { message: "Name should be at least 3 characters" })
    .max(50),
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  description: z
    .string({
      message: "Description is required",
    })
    .min(20, { message: "Description should be at least 20 characters" })
    .max(400, { message: "Description should be at most 400 characters" }),
  slug: z.string().optional(),
});

const paystackInfoSchema = z.object({
  publicKey: z.string().min(2, { message: "Public key is required." }),
  secretKey: z.string().min(2, { message: "Secret key is required." }),
  hasAddedWebhookAndCallbackURL: z.literal(true),
});

export const createStoreSchema = z
  .object({
    ...storeInfoSchema.shape,
    ...deliveryInfoSchema.shape,
    ...paystackInfoSchema.shape,
  })
  .refine((data) => {
    data.name = data.name.toLowerCase();
    if (!data.slug) {
      data.slug = slugify(data.name);
    }
    return true;
  });

export const getStoreSchema = z.object({
  id: z.number(),
  userId: z.string(),
});
export type CreateStoreSchema = z.infer<typeof createStoreSchema>;

export function CreateStore() {
  const [step, setStep] = React.useState(1);
  const { user } = useUser();
  const router = useRouter();

  const [isCreatePending, startCreateTransaction] = React.useTransition();
  const submitOnboarding = useAction(api.users.submitOnboarding);

  const form = useForm<CreateStoreSchema>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      slug: "",
      deliveryOptions: [{ name: "", price: 0 }],
      publicKey: "",
      secretKey: "",
    },
  });

  // Get the current schema based on the step
  const getCurrentSchema = () => {
    switch (step) {
      case 1:
        return storeInfoSchema;
      case 2:
        return deliveryInfoSchema;
      case 3:
        return paystackInfoSchema;
      default:
        return storeInfoSchema;
    }
  };

  // Handle next step navigation
  const handleNext = async () => {
    const currentSchema = getCurrentSchema();

    // Touch only the fields for the current step
    const currentFields = Object.keys(currentSchema.shape);

    console.log(currentFields);

    // Get only the values for the current step
    const currentValues = currentFields.reduce(
      (acc, key) => {
        const value = form.getValues(key as keyof CreateStoreSchema);
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    // Validate only the current step fields
    const result = await currentSchema.safeParseAsync(currentValues);

    if (result.success) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Only set errors for the current step's fields
      result.error.errors.forEach((error) => {
        const path = error.path.join(".") as keyof CreateStoreSchema;
        // Only set error if the field is part of the current step
        if (currentFields.some((field) => path.startsWith(field))) {
          form.setError(path, {
            type: "manual",
            message: error.message,
          });
        }
      });
    }
  };

  // Handle previous step navigation
  const handlePrevious = () => {
    setStep(step - 1);
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };

  async function onSubmit(values: CreateStoreSchema) {
    startCreateTransaction(async () => {
      try {
        const { data: slug, error } = await tryCatch(
          submitOnboarding({
            ...omit(values, ["slug", "hasAddedWebhookAndCallbackURL"]),
            slug: values.slug!,
          })
        );

        if (error) {
          console.error(error);
          showErrorToast(error);
          return;
        }

        await user?.reload();
        form.reset();
        toast.success("store created successfully");
        return router.push(`/dashboard/${slug}/editor_?from=onboarding`);
      } catch (err) {
        toast.error(showErrorToast(err));
      }
    });
  }

  return (
    <AnimatedGroup
      preset="blur-slide"
      className="flex flex-col space-y-4 rounded-xl p-8 max-w-xl"
    >
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Your Store</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your online store in just a few steps. We&apos;ll guide you
          through the process.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  step === stepNumber
                    ? "border-primary bg-primary text-primary-foreground"
                    : step > stepNumber
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground bg-background text-muted-foreground"
                )}
              >
                {step > stepNumber ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm",
                  step === stepNumber
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {stepNumber === 1
                  ? "Store Info"
                  : stepNumber === 2
                    ? "Shipping Address"
                    : "Payment Info"}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted"></div>
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
      <div>
        <CreateStoreForm step={step} form={form} onSubmit={onSubmit}>
          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isCreatePending}>
                {isCreatePending && (
                  <Loader className="mr-2 size-4 animate-spin" />
                )}
                Create store
              </Button>
            )}
          </div>
        </CreateStoreForm>
      </div>
    </AnimatedGroup>
  );
}

interface CreateStoreFormProps
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  step: number;
  children: React.ReactNode;
  form: UseFormReturn<CreateStoreSchema>;
  onSubmit: (data: CreateStoreSchema) => void;
}

export function CreateStoreForm({
  children,
  step,
  form,
  onSubmit,
  className,
  ...props
}: CreateStoreFormProps) {
  const { description } = useWatch({ control: form.control });

  return (
    <Form {...form}>
      <form
        className={cn("grid w-full gap-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        {...props}
      >
        {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Store Information</h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type store name here."
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type store email here."
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Description ({description?.length}/400)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type store description here."
                      onChange={(e) =>
                        onChange(e.currentTarget.value.slice(0, 400))
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Shipping Address */}
        {step === 2 && <ShippingAddressForm form={form} />}

        {/* Step 3: Payment Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Payment Info</h2>
              <p className="text-sm">
                We manage payments using Paystack.{" "}
                <Link
                  className="text-blue-500 hover:underline inline-flex gap-1 items-center"
                  href="https://paystack.com/"
                  target="_blank"
                >
                  Sign Up
                  <SquareArrowOutUpRight className="size-3" />
                </Link>
              </p>
            </div>

            <FormField
              control={form.control}
              name="publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paystack Public Key</FormLabel>
                  <FormControl>
                    <Input placeholder="pk_live_da16..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paystack Secret Key</FormLabel>
                  <FormControl>
                    <Input placeholder="sk_live_da16..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CopyInput
              label="Paystack Webhook URL"
              description="Add Webhook URL in your paystack webhook URL panel"
            />
            <CopyInput
              label="Paystack Callback URL"
              description="Add Callback URL in your paystack callback URL panel"
            />
            <FormField
              control={form.control}
              name="hasAddedWebhookAndCallbackURL"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I have added Webhook URL and Callback URL
                    </FormLabel>
                    <FormDescription>
                      It is really important to add these webhooks to ensure
                      that customer payments are properly processed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
        {children}
      </form>
    </Form>
  );
}

export default function CopyInput({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get the current URL when the component mounts or the modal opens
  const cloudURL = process.env.NEXT_PUBLIC_CONVEX_URL!;
  if (process.env.NODE_ENV !== "production") {
    if (!cloudURL) {
      throw new Error("webhookURL is required");
    }
  }

  const webhookURL = cloudURL + "/paystack";

  const copyToClipboard = async () => {
    if (inputRef.current) {
      try {
        await navigator.clipboard.writeText(inputRef.current.value);
        toast(`The ${label} has been copied to your clipboard`);
      } catch (err) {
        console.error(err);
        toast.error("Could not copy the URL to clipboard");
      }
    }
  };

  return (
    <div className="mt-4">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2 my-2">
        <Input ref={inputRef} value={webhookURL} readOnly className="flex-1" />
        <Button onClick={copyToClipboard} type="button">
          Copy
        </Button>
      </div>
      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
    </div>
  );
}

const ShippingAddressForm = ({
  form,
}: {
  form: UseFormReturn<CreateStoreSchema>;
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold"> Delivery Information</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm">Set up your delivery options and pricing</p>
        </div>

        <FormField
          control={form.control}
          name="deliveryOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Offerings</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.value?.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`deliveryOptions.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Within Lagos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`deliveryOptions.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Price (₦)"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d*$/.test(value)) {
                                    field.onChange(Number(value));
                                  }
                                }}
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <button
                        type="button"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => {
                          const newOfferings = field.value.filter(
                            (_, i) => i !== index
                          );
                          form.setValue("deliveryOptions", newOfferings);
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
                      const currentOfferings =
                        form.getValues("deliveryOptions") || [];
                      form.setValue("deliveryOptions", [
                        ...currentOfferings,
                        { name: "", price: 0 },
                      ]);
                    }}
                  >
                    Add Delivery Option
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

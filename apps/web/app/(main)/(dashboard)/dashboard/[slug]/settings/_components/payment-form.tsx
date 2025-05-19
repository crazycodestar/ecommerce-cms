"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// import {} from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
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
import React from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { tryCatch } from "@/lib/try-catch";
import { Loader } from "lucide-react";
import { omit } from "es-toolkit";

const paystackInfoSchema = z.object({
  publicKey: z.string().min(2, { message: "Public key is required." }),
  secretKey: z.string().min(2, { message: "Secret key is required." }),
  hasAddedWebhookAndCallbackURL: z.literal(true),
});

type PaystackInfoValues = z.infer<typeof paystackInfoSchema>;

export function PaymentForm({
  defaultValues,
  slug,
}: {
  defaultValues: PaystackInfoValues;
  slug: string;
}) {
  const form = useForm<PaystackInfoValues>({
    resolver: zodResolver(paystackInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const [isPending, startTransition] = React.useTransition();
  const updateStore = useMutation(api.stores.updateStore);
  async function onSubmit(data: PaystackInfoValues) {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateStore({
          ...omit(data, ["hasAddedWebhookAndCallbackURL"]),
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
                <FormLabel>I have added Webhook URL and Callback URL</FormLabel>
                <FormDescription>
                  It is really important to add these webhooks to ensure that
                  customer payments are properly processed
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit">
          {isPending && <Loader className="size-4 animate-spin" />} Update
          Payment
        </Button>
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

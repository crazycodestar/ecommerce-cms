"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@packages/backend/convex/_generated/api";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader, Trash2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const shippingInfoSchema = z.object({
  deliveryOptions: z.array(
    z.object({
      name: z.string().min(1, { message: "Name is required" }),
      price: z.number().min(1, { message: "Price must be greater than 0" }),
    })
  ),
});

type ShippingInfoValues = z.infer<typeof shippingInfoSchema>;

export function ShippingForm({
  defaultValues,
  slug,
}: {
  defaultValues: Partial<ShippingInfoValues>;
  slug: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const updateStore = useMutation(api.stores.updateStore);

  const form = useForm<ShippingInfoValues>({
    resolver: zodResolver(shippingInfoSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ShippingInfoValues) {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateStore({
          ...data,
          slug,
        })
      );

      if (error) return void toast.error("Failed to update store.");
      toast.success("Shipping info updated.");
    });
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <>
            <div className="space-y-4">
              <div>
                <p className="text-sm">Manage delivery offerings and pricing</p>
              </div>

              {form.watch("deliveryOptions")?.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Within Lagos"
                    {...form.register(`deliveryOptions.${index}.name`)}
                  />
                  <Input
                    type="number"
                    placeholder="Price (₦)"
                    {...form.register(`deliveryOptions.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                  <button
                    type="button"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => {
                      const newOfferings = form
                        .getValues("deliveryOptions")
                        .filter((_, i) => i !== index);
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

            <Button disabled={isPending} type="submit">
              {isPending && <Loader className="mr-2 size-4 animate-spin" />}
              Update Shipping
            </Button>
          </>
        </form>
      </Form>
    </div>
  );
}

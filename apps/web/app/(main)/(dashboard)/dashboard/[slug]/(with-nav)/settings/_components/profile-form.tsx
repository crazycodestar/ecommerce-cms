"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// import {} from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@packages/backend/convex/_generated/api";
import { tryCatch } from "@/lib/try-catch";
import { useMutation } from "convex/react";
import { Loader } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const storeInfoSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(20).max(400),
  slug: z.string().optional(),
});

type StoreInfoValues = z.infer<typeof storeInfoSchema>;

export function ProfileForm({
  defaultValues,
  slug,
}: {
  defaultValues: Partial<StoreInfoValues>;
  slug: string;
}) {
  const form = useForm<StoreInfoValues>({
    resolver: zodResolver(storeInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const [isPending, startTransition] = React.useTransition();
  const updateStore = useMutation(api.stores.updateStore);
  async function onSubmit(data: StoreInfoValues) {
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
          name="description"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>
                Description ({form.watch("description")?.length}/400)
              </FormLabel>
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
        <Button disabled={isPending} type="submit">
          {isPending && <Loader className="size-4 animate-spin" />} Update Store
        </Button>
      </form>
    </Form>
  );
}

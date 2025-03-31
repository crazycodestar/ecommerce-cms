"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import { slugify } from "@/lib/slugify";
import { Loader } from "lucide-react";

import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
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
import { api } from "@/convex/_generated/api";
import { showErrorToast } from "@/lib/handle-error";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useAction } from "convex/react";

export const createStoreSchema = z
  .object({
    name: z.string().min(3).max(50),
    description: z.string().min(20).max(400),
    slug: z.string().optional(),
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
  const { user } = useUser();
  const router = useRouter();

  const [isCreatePending, startCreateTransaction] = useTransition();
  const submitOnboarding = useAction(api.users.submitOnboarding);

  const form = useForm<CreateStoreSchema>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateStoreSchema) {
    startCreateTransaction(async () => {
      try {
        const res = await submitOnboarding({
          name: values.name,
          description: values.description,
          slug: values.slug!,
        });
        if (res.message) {
          await user?.reload();
          toast.success("store created successfully");
          router.push("/dashboard");
        }
      } catch (err) {
        toast.error(showErrorToast(err));
      } finally {
        form.reset();
      }
    });
  }

  return (
    <AnimatedGroup
      preset="blur-slide"
      className="flex flex-col space-y-4 rounded-xl p-8"
    >
      <div className="w-full space-y-1.5">
        <h1 className="text-pretty text-2xl font-bold transition-colors sm:text-3xl">
          Connect you accout to a store
        </h1>
        <p className="text-pretty text-sm text-muted-foreground transition-colors sm:text-base">
          You can update your store name and description later
        </p>
      </div>
      <div>
        <CreateStoreForm form={form} onSubmit={onSubmit}>
          <Button type="submit" disabled={isCreatePending}>
            {isCreatePending && <Loader className="mr-2 size-4 animate-spin" />}
            Create store
          </Button>
        </CreateStoreForm>
      </div>
    </AnimatedGroup>
  );
}

interface CreateStoreFormProps
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<CreateStoreSchema>;
  onSubmit: (data: CreateStoreSchema) => void;
}

export function CreateStoreForm({
  children,
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
        {children}
      </form>
    </Form>
  );
}

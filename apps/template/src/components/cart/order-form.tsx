import { cn } from "@/lib/utils";
import React from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "../form/form-input";
import { ImageUploader } from "../form/image-uploader";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export const metadataTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("string"),
    value: z.string().min(1, { message: "Please enter a value" }),
  }),
  z.object({
    type: z.literal("image"),
    value: z.string().min(1, { message: "Select an Image" }),
  }),
  z.object({
    type: z.literal("number"),
    value: z.coerce.number().min(1),
  }),
  z.object({
    type: z.literal("array"),
    value: z.string(),
  }),
]);

export const orderSchema = z.object({
  productId: z.string(),
  variants: z.array(
    z.object({
      name: z.string(),
      value: z.string().min(1, { message: "Please select an option" }),
    })
  ),
  metadatas: z.array(
    z
      .object({
        name: z.string(),
        //   value: z.string().min(1, { message: "Please select a value." }),
      })
      .and(metadataTypeSchema)
  ),
  quantity: z.coerce.number().min(1),
});

export type OrderSchema = z.infer<typeof orderSchema>;

export type OrderContext = {
  form: UseFormReturn<OrderSchema>;
  //   formProps: UseFormProps<OrderSchema>;
  onSubmit: (values: OrderSchema) => void;
  isPending?: boolean;
  //   setValue: (name: string, value: any) => void;
  //   getValues: (name: string) => any;
  //   watch: (name: string) => any;
  //   reset: (values?: Partial<OrderSchema>) => void;
};

const OrderFormContext = React.createContext<OrderContext>({
  form: {} as UseFormReturn<OrderSchema>,
  onSubmit: () => {},
  isPending: false,
  //   formProps: {} as UseFormProps<OrderSchema>,
  //   setValue: () => {},
  //   getValues: () => {},
  //   watch: () => {},
  //   reset: () => {},
});

export const useOrder = () => {
  const value = React.useContext(OrderFormContext);
  if (import.meta.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useOrder must be wrapped in a <OrderProvider />");
    }
  }

  return value;
};

export const OrderProvider = ({
  value,
  children,
}: {
  children?: React.ReactNode;
  value: OrderContext;
}) => {
  const { form, onSubmit } = value;

  return (
    <OrderFormContext.Provider value={value}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {children}
        </form>
      </Form>
    </OrderFormContext.Provider>
  );
};

export const QuantityField = ({ unit }: { unit: string }) => {
  const { form, isPending } = useOrder();

  return (
    <FormField
      control={form.control}
      name="quantity"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quantity</FormLabel>
          <div className="flex  shadow-sm shadow-black/5">
            <Input
              id="input-18"
              className="-me-px shadow-none focus-visible:z-10 -none"
              placeholder="Quantity"
              type="number"
              disabled={isPending}
              {...field}
            />
            <div className="h-9  border px-3 flex items-center justify-center">
              {unit}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export interface VariantFieldProps {
  variants: {
    name: string;
    options: { image?: string | null; name: string }[];
  }[];
}

export const VariantField = ({ variants }: VariantFieldProps) => {
  const { form } = useOrder();
  const { fields } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  return (
    <div>
      {/* <pre>{JSON.stringify(form.watch("variant"), null, 2)}</pre> */}
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={form.control}
          name={`variants.${index}.value`}
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>Select a {field.name}</FormLabel>
              <div className="flex gap-2">
                {variants[index].options.map((variant, index) => (
                  <div
                    onClick={() => onChange(variant.name)}
                    key={index}
                    className={cn(
                      "border text-foreground py-2 px-3 cursor-pointer",
                      value === variant.name
                        ? "bg-primary text-primary-foreground"
                        : ""
                    )}
                  >
                    {variant.name}
                  </div>
                ))}
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export interface MetadataFieldProps {
  metadatas: {
    name: string;
    type: "number" | "string" | "image" | "array";
  }[];
}

export const MetadataField = ({ metadatas }: MetadataFieldProps) => {
  const { form } = useOrder();
  const { fields } = useFieldArray({
    control: form.control,
    name: "metadatas",
  });

  return (
    <div className="flex flex-col gap-4">
      {/* <pre>here: {JSON.stringify(form.watch("metadatas"), null, 2)}</pre> */}
      {fields.map((field, index) => (
        <React.Fragment key={field.id}>
          {metadatas[index].type === "string" && (
            <>
              <input
                {...form.register(`metadatas.${index}.type`)}
                type="hidden"
                value="string"
              />
              <FormInput
                label={field.name}
                placeholder={field.name}
                control={form.control}
                name={`metadatas.${index}.value`}
              />
            </>
          )}
          {metadatas[index].type === "image" && (
            <>
              <input
                {...form.register(`metadatas.${index}.type`)}
                type="hidden"
                value="image"
              />
              <ImageUploader
                label={field.name}
                control={form.control}
                name={`metadatas.${index}.value`}
              />
            </>
          )}
          {metadatas[index].type === "number" && (
            <>
              <input
                {...form.register(`metadatas.${index}.type`)}
                type="hidden"
                value="string"
              />
              <FormInput
                label={field.name}
                placeholder={field.name}
                control={form.control}
                name={`metadatas.${index}.value`}
              />
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

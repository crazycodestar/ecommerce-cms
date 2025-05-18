import * as z from "zod";

export const PropertyType = z.union([
  z.literal("string"),
  z.literal("number"),
  z.literal("array"),
]);
export const property = z.object({
  key: z.string().min(1, { message: "Name is required" }),
  type: PropertyType,
});

export type Property = z.infer<typeof property>;

export const variants = z.array(
  z.object({
    name: z.string().min(1),
    options: z
      .array(
        z
          .object({
            name: z
              .string()
              .min(2, {
                message: "Product name must be at least 2 characters.",
              })
              .max(160, {
                message: "Product name must be at most 160 characters",
              }),
            price: z.coerce
              .number()
              .positive({ message: "Price must be a positive number" }),
            stock: z.coerce.number(),
            imageId: z.string().optional(),
            isUnspecified: z.boolean(),
          })
          .refine(
            (val) => {
              if (!val.isUnspecified) return val.stock > 0;
              val.stock = 0;
              return true;
            },
            {
              message: "Stock should be atleast 1 or more",
              path: ["stock"],
            }
          )
      )
      .min(1, { message: "Atleast one option is required" }),
  })
);

export const properties = z.array(
  z
    .object({
      property,
      value: z.union([
        z.string().min(1),
        z.coerce.number(),
        z.array(z.string()),
      ]),
    })
    .refine((val) => typeof val.value === val.property.type, {
      message: "Required",
      path: ["value"],
    })
);

export const productSchema = z
  .object({
    images: z
      .array(
        z.object({
          imageId: z.string().min(1),
        })
      )
      .min(1, { message: "Atleast 1 images are required" }),
    name: z
      .string()
      .min(2, {
        message: "Product name must be at least 2 characters.",
      })
      .max(160, { message: "Product name must be at most 160 characters" }),
    additionalInformation: z.string().optional(),
    price: z.coerce
      .number()
      .positive({ message: "Price must be a positive number" }),
    stock: z.coerce.number(),
    unitType: z.string().min(1, { message: "Unit Type is Required" }),
    isUnspecified: z.boolean(),
    categoryId: z.string().optional(),
    properties: properties.optional(),
    variants,
    metadatas: z.array(
      z.object({
        _id: z.string(),
      })
    ),
    terminal: z.optional(
      z.object({
        weight: z.number(),
        packageId: z.string().min(1, { message: "Package is required" }),
      })
    ),
  })
  .refine(
    (val) => {
      if (!val.isUnspecified) return val.stock > 0;
      val.stock = 0;
      return true;
    },
    {
      message: "Stock should be atleast 1 or more",
      path: ["stock"],
    }
  );

export type ProductSchema = z.infer<typeof productSchema>;

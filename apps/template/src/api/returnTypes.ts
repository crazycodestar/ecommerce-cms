import { z } from "zod";

// Base schemas
const idSchema = z.string();

const propertySchema = z.object({
  _id: idSchema,
  name: z.string(),
  storeId: idSchema,
  categoryId: idSchema,
  options: z.array(z.string()).optional(),
  type: z.enum(["string", "number", "array"]),
});

const productPropertySchema = z.object({
  propertyId: idSchema,
  value: z.union([z.string(), z.number(), z.array(z.string())]),
});

const productVariantOptionSchema = z.object({
  name: z.string(),
  price: z.number(),
  imageId: z.string().optional(),
  stock: z.number(),
  isUnspecified: z.boolean(),
});

const productVariantSchema = z.object({
  name: z.string(),
  options: z.array(productVariantOptionSchema),
});

const terminalDeliveryInfoSchema = z.object({
  deliveryType: z.literal("terminal"),
  terminalSecretKey: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zip: z.string(),
});

const customDeliveryInfoSchema = z.object({
  deliveryType: z.literal("custom"),
  offerings: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
});

export const getDeliveryInfoResponseSchema = z.union([
  terminalDeliveryInfoSchema,
  customDeliveryInfoSchema,
]);

const productSchema = z.object({
  _id: idSchema,
  storeId: idSchema,
  images: z.array(z.string()),
  name: z.string(),
  additionalInformation: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  unitType: idSchema,
  isUnspecified: z.boolean(),
  categoryId: idSchema,
  variants: z.array(productVariantSchema).optional(),
  properties: z.array(productPropertySchema),
  metadataIds: z.array(idSchema).optional(),
  terminal:z.optional(z.object({
    weight: z.number(),
    packageId: idSchema,
  })),
  mainImage: z.string().optional(), // Added for API responses that include mainImage
});

const categorySchema = z.object({
  _id: idSchema,
  name: z.string(),
  storeId: idSchema,
  parentId: idSchema.optional(),
});

const collectionSchema = z.object({
  _id: idSchema,
  storeId: idSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  imageId: z.string().optional(),
});

// Rich product schema (for getProductById)
export const richProductSchema = productSchema.extend({
  imageUrls: z.array(z.string()),
  categoryTree: z.array(categorySchema),
  properties: z.array(
    z.object({
      propertyId: idSchema,
      value: z.union([z.string(), z.number(), z.array(z.string())]),
      property: propertySchema,
    })
  ),
  unit: z.string().optional(),
  variants: z
    .array(
      productVariantSchema.extend({
        options: z.array(
          productVariantOptionSchema.extend({
            image: z.string().optional(),
          })
        ),
      })
    )
    .optional(),
  metadatas: z
    .array(
      z.object({
        _id: idSchema,
        metadata: z.object({
          _id: idSchema,
          name: z.string(),
          //   value: z.string(),
          storeId: idSchema,
          type: z.union([
            z.literal("string"),
            z.literal("number"),
            z.literal("array"),
            z.literal("image"),
          ]),
        }),
      })
    )
    .optional(),
  comment: z.null(),
});

// Order schemas
const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  metadatas: z
    .array(
      z.object({
        name: z.string(),
        value: z.union([z.string(), z.number()]),
      })
    )
    .optional(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().optional(),
});

const orderSchema = z.object({
  _id: idSchema,
  slug: z.string(),
  items: z.array(orderItemSchema),
  firstName: z.string(),
  lastName: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  state: z.string(),
  city: z.string(),
  zip: z.string(),
  country: z.string(),
  rateId: z.string(),
  phone: z.string(),
  email: z.string(),
  terminalAddressId: z.string(),
  terminalParcelId: z.string(),
  terminalTrackingNumber: z.string().optional(),
  terminalTrackingUrl: z.string().optional(),
  storeId: idSchema,
  amount: z.number(),
  shipping: z.number(),
  url: z.string().optional(),
  accessCode: z.string().optional(),
  reference: z.string().optional(),
  status: z.union([z.literal("pending"), z.literal("success"), z.string()]),
});

// Terminal schemas
const terminalRateSchema = z.object({
  rate_id: z.string(),
  parcel: z.string(),
  // ^? I added
  amount: z.number(),
  cargo_type: z.string(),
  carrier_logo: z.string().url(),
  carrier_name: z.string(),
  carrier_rate_description: z.string(),
  carrier_reference: z.string(),
  carrier_slug: z.string(),
  created_at: z.string().datetime(),
  currency: z.string(),
  default_amount: z.number(),
  default_currency: z.string(),
  delivery_address: z.string(),
  delivery_date: z.string().datetime(),
  delivery_eta: z.number(),
  delivery_time: z.string(),
  domain: z.string(),
  dropoff_available: z.boolean(),
  dropoff_only: z.boolean(),
  dropoff_required: z.boolean(),
  id: z.string(),
  includes_duties: z.boolean(),
  includes_insurance: z.boolean(),
  insurance_coverage: z.number(),
  insurance_fee: z.number(),
  metadata: z.object({
    recommended: z.string().optional(),
    // ^? I added
    address_payload: z.object({
      delivery_address: z.object({
        city: z.string(),
        country: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      pickup_address: z.object({
        city: z.string(),
        country: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
    }),
    avgRating: z.number(),
    cod_processing_fee: z.number(),
    insurance_fee: z.number(),
    score: z.number(),
    shipment_cost: z.number(),
  }),
  pickup_address: z.string(),
  pickup_eta: z.number(),
  pickup_time: z.string(),
  source: z.string(),
  type: z.string(),
});

// Contents schema
const carouselSchema = z.object({
  name: z.literal("carousel"),
  object: z.object({
    content: z
      .array(
        z.object({
          imageId: z.string(),
          collectionId: z.string(),
        })
      )
      .min(1, { message: "Atleast one image is required" }),
  }),
});

const productCarouselSchema = z.object({
  name: z.literal("productCarousel"),
  object: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    collectionId: z.string().min(1, { message: "Please select a collection" }),
  }),
});

const collectionCarouselSchema = z.object({
  name: z.literal("collectionCarousel"),
  object: z.object({
    items: z
      .array(
        z.object({
          imageId: z.string().min(1, { message: "Image is required" }),
          title: z.string().min(1, { message: "Title is required" }),
          description: z
            .string()
            .min(1, { message: "Description is required" }),
          collectionId: z
            .string()
            .min(1, { message: "Please select a collection" }),
        })
      )
      .min(1, { message: "Atleast one collection is required" }),
  }),
});

const banner = z.object({
  name: z.literal("banner"),
  object: z.object({
    imageId: z.string().min(1, { message: "Image is required" }),
    link: z.string().url({ message: "Link must be a valid URL" }),
  }),
});

const categories = z.object({
  name: z.literal("categories"),
  object: z.object({
    items: z
      .array(
        z.object({
          imageId: z.string().min(1, { message: "Image is required" }),
          title: z.string().min(1, { message: "Title is required" }),
          categoryId: z
            .string()
            .min(1, { message: "Please select a category" }),
        })
      )
      .min(1, { message: "Atleast one category is required" }),
  }),
});

export const contentSchema = z.union([
  banner,
  categories,
  carouselSchema,
  productCarouselSchema,
  collectionCarouselSchema,
]);

export type ContentSchema = z.infer<typeof contentSchema>;

// API Response schemas
export const getFiltersResponseSchema = z.array(propertySchema);

export const getCollectionBySlugAndStoreSlugResponseSchema = collectionSchema;

export const getProductsByCollectionSlugAndStoreSlugResponseSchema =
  z.array(productSchema);

export const getProductsByCategoryIdAndStoreSlugResponseSchema =
  z.array(productSchema);

export const getCategoriesByStoreSlugResponseSchema = z.array(categorySchema);

export const getSubCategoriesByParentIdAndStoreSlugResponseSchema =
  z.array(categorySchema);

export const getCategoryByIdAndStoreSlugResponseSchema = categorySchema;

export const getProductByIdResponseSchema = richProductSchema;

export const getOrderByReferenceOrSlugResponseSchema = orderSchema.nullable();

export const initializeOrderResponseSchema = z.object({
  accessCode: z.string(),
  url: z.string(),
  slug: z.string(),
});

export const getStatesResponseSchema = z.array(
  z.object({
    name: z.string(),
    countryCode: z.string(),
    isoCode: z.string(),
  })
);

export const getCitiesResponseSchema = z.array(
  z.object({
    name: z.string(),
    stateCode: z.string(),
    countryCode: z.string(),
  })
);

export const getProductsByStoreSlugResponseSchema = z.array(
  z.object({
    _id: z.string(),
    name: z.string(),
    additionalInformation: z.string().optional(),
    price: z.number(),
    images: z.array(z.string()),
    imageUrls: z.array(z.string()),
    storeId: z.string(),
    categoryId: z.string(),
    collections: z.array(
      z.object({
        _id: z.string(),
        name: z.string(),
        slug: z.string(),
        storeId: z.string(),
      })
    ),
  })
);

export const getImageUrlResponseSchema = z.string();

export const generateUploadUrlResponseSchema = z.string();

export const getProductsByIdsResponseSchema = z.array(richProductSchema);

export type GetProductsByIdsResponse = z.infer<
  typeof getProductsByIdsResponseSchema
>;

export const getRatesResponseSchema = z.array(terminalRateSchema);

export const getContentsByStoreSlugResponseSchema = z.array(contentSchema);

// Type exports
export type GetFiltersResponse = z.infer<typeof getFiltersResponseSchema>;
export type GetCollectionBySlugAndStoreSlugResponse = z.infer<
  typeof getCollectionBySlugAndStoreSlugResponseSchema
>;
export type GetProductsByCollectionSlugAndStoreSlugResponse = z.infer<
  typeof getProductsByCollectionSlugAndStoreSlugResponseSchema
>;
export type GetProductsByCategoryIdAndStoreSlugResponse = z.infer<
  typeof getProductsByCategoryIdAndStoreSlugResponseSchema
>;
export type GetCategoriesByStoreSlugResponse = z.infer<
  typeof getCategoriesByStoreSlugResponseSchema
>;
export type GetSubCategoriesByParentIdAndStoreSlugResponse = z.infer<
  typeof getSubCategoriesByParentIdAndStoreSlugResponseSchema
>;
export type GetCategoryByIdAndStoreSlugResponse = z.infer<
  typeof getCategoryByIdAndStoreSlugResponseSchema
>;
export type GetProductByIdResponse = z.infer<
  typeof getProductByIdResponseSchema
>;
export type GetOrderByReferenceOrSlugResponse = z.infer<
  typeof getOrderByReferenceOrSlugResponseSchema
>;
export type InitializeOrderResponse = z.infer<
  typeof initializeOrderResponseSchema
>;
export type GetStatesResponse = z.infer<typeof getStatesResponseSchema>;
export type GetCitiesResponse = z.infer<typeof getCitiesResponseSchema>;
export type GetRatesResponse = z.infer<typeof getRatesResponseSchema>;
export type GetContentsByStoreSlugResponse = z.infer<
  typeof getContentsByStoreSlugResponseSchema
>;
export type GetImageUrlResponse = z.infer<typeof getImageUrlResponseSchema>;
export type GenerateUploadUrlResponse = z.infer<
  typeof generateUploadUrlResponseSchema
>;
export type GetProductsByStoreSlugResponse = z.infer<
  typeof getProductsByStoreSlugResponseSchema
>;

export type GetDeliveryInfoResponse = z.infer<typeof getDeliveryInfoResponseSchema>;

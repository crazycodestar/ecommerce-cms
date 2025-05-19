import { Table } from "convex-helpers/server";
import { defineSchema } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";
import { Collections, CollectionsOnProducts } from "./collections";

// TODO: simplify users table
export const Users = Table("users", {
  id: v.string(),
  object: v.string(),
  first_name: v.union(v.string(), v.null()),
  last_name: v.union(v.string(), v.null()),
  username: v.union(v.string(), v.null()),
  created_at: v.number(),
  updated_at: v.number(),
  last_sign_in_at: v.union(v.number(), v.null()),
  image_url: v.string(),
  external_id: v.union(v.string(), v.null()),
  password_enabled: v.boolean(),
  two_factor_enabled: v.boolean(),

  // Email address related fields
  primary_email_address_id: v.union(v.string(), v.null()),
  email_addresses: v.array(
    v.object({
      id: v.string(),
      object: v.string(),
      email_address: v.string(),
      linked_to: v.array(
        v.object({
          id: v.string(),
          type: v.string(),
        })
      ),
      verification: v.union(
        v.object({
          status: v.string(),
          strategy: v.string(),
        }),
        v.null()
      ),
    })
  ),

  // Phone number related fields
  primary_phone_number_id: v.union(v.string(), v.null()),
  phone_numbers: v.array(v.any()),

  // Web3 wallet related fields
  primary_web3_wallet_id: v.union(v.string(), v.null()),
  web3_wallets: v.array(v.any()),

  // External accounts
  external_accounts: v.array(v.any()),

  // Metadata fields
  private_metadata: v.object({}),
  public_metadata: v.optional(v.object({})),
  unsafe_metadata: v.object({}),
});

export const userSchema = z.object({
  id: z.string(),
  object: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  username: z.string().nullable(),
  created_at: z.number(),
  updated_at: z.number(),
  last_sign_in_at: z.number().nullable(),
  image_url: z.string(),
  external_id: z.string().nullable(),
  password_enabled: z.boolean(),
  two_factor_enabled: z.boolean(),

  // Email address related fields
  primary_email_address_id: z.string().nullable(),
  email_addresses: z.array(
    z.object({
      id: z.string(),
      object: z.string(),
      email_address: z.string(),
      linked_to: z.array(z.any()),
      verification: z
        .object({
          status: z.string(),
          strategy: z.string(),
        })
        .nullable(),
    })
  ),

  // Phone number related fields
  primary_phone_number_id: z.string().nullable(),
  phone_numbers: z.array(z.any()),

  // Web3 wallet related fields
  primary_web3_wallet_id: z.string().nullable(),
  web3_wallets: z.array(z.any()),

  // External accounts
  external_accounts: z.array(z.any()),

  // Metadata fields
  private_metadata: z.record(z.any()),
  // public_metadata: z.record(z.any()),
  unsafe_metadata: z.record(z.any()),
});

// Type derived from the schema
export type User = z.infer<typeof userSchema>;

// Optional partial schema for updates
export const userUpdateSchema = userSchema.partial();
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Schema for creating a new user with required fields
export const userCreateSchema = userSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    // Add any fields that must be present when creating a user
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email_addresses: z
      .array(
        z.object({
          email_address: z.string().email(),
          linked_to: z.array(z.any()).optional(),
          verification: z.any().optional().nullable(),
        })
      )
      .min(1),
  });
export type UserCreate = z.infer<typeof userCreateSchema>;

export const carousel = v.object({
  name: v.literal("carousel"),
  object: v.object({
    content: v.array(
      v.object({
        imageId: v.id("_storage"),
        collectionId: v.id("collections"),
      })
    ),
  }),
});

export const productCarousel = v.object({
  name: v.literal("productCarousel"),
  object: v.object({
    title: v.string(),
    description: v.string(),
    collectionId: v.id("collections"),
  }),
});

export const banner = v.object({
  name: v.literal("banner"),
  object: v.object({
    imageId: v.id("_storage"),
    link: v.string(),
  }),
});

export const collectionCarousel = v.object({
  name: v.literal("collectionCarousel"),
  object: v.object({
    items: v.array(
      v.object({
        imageId: v.id("_storage"),
        title: v.string(),
        description: v.string(),
        collectionId: v.id("collections"),
      })
    ),
  }),
});

export const categories = v.object({
  name: v.literal("categories"),
  object: v.object({
    items: v.array(
      v.object({
        imageId: v.id("_storage"),
        title: v.string(),
        categoryId: v.id("categories"),
      })
    ),
  }),
});

// untion of all content types
export const contentTypes = v.union(
  carousel,
  productCarousel,
  banner,
  collectionCarousel,
  categories
);

// Store schema
export const Stores = Table("stores", {
  name: v.string(),
  email: v.string(),
  description: v.string(),
  owner: v.string(),
  slug: v.string(),
  contents: v.array(contentTypes),
  contentJson: v.optional(v.string()),
  logoId: v.optional(v.id("_storage")),
  siteUrl: v.optional(v.string()),
  deliveryOptions: v.array(
    v.object({
      name: v.string(),
      price: v.number(),
    })
  ),
  // Shipping Information with terminal
  // Payment Information with Paystack
  publicKey: v.string(),
  secretKey: v.string(),
});

// Product Schema
export const Products = Table("products", {
  storeId: v.id("stores"),
  images: v.array(v.id("_storage")),
  name: v.string(),
  additionalInformation: v.optional(v.string()),
  price: v.number(),
  stock: v.number(),
  unitType: v.id("unitTypes"),
  isUnspecified: v.boolean(),
  categoryId: v.optional(v.id("categories")),
  variants: v.optional(
    v.array(
      v.object({
        name: v.string(),
        options: v.array(
          v.object({
            name: v.string(),
            price: v.number(),
            imageId: v.optional(v.id("_storage")),
            stock: v.number(),
            isUnspecified: v.boolean(),
          })
        ),
      })
    )
  ),
  properties: v.optional(
    v.array(
      v.object({
        propertyId: v.id("properties"),
        value: v.union(v.string(), v.number(), v.array(v.string())),
      })
    )
  ),
  metadataIds: v.optional(v.array(v.id("metadatas"))),
});

// UnitType schema
export const UnitTypes = Table("unitTypes", {
  name: v.string(),
  storeId: v.id("stores"),
});

// Metadata schema
export const Metadatas = Table("metadatas", {
  name: v.string(),
  storeId: v.id("stores"),
  type: v.union(
    v.literal("string"),
    v.literal("number"),
    v.literal("array"),
    v.literal("image")
  ),
});

// MetadataPresets schema
export const MetadataPresets = Table("metadataPresets", {
  name: v.string(),
  storeId: v.id("stores"),
  metadataIds: v.array(v.id("metadatas")),
});

// Categories schema
// FIXME: Categories should have a slug
export const Categories = Table("categories", {
  name: v.string(),
  storeId: v.id("stores"),
  parentId: v.optional(v.id("categories")),
});

// FIXME: properties should have a slug
export const Properties = Table("properties", {
  name: v.string(),
  storeId: v.id("stores"),
  categoryId: v.id("categories"),
  options: v.optional(v.array(v.string())),
  type: v.union(v.literal("string"), v.literal("number"), v.literal("array")),
});

export const Orders = Table("orders", {
  slug: v.string(),
  items: v.array(
    v.object({
      productId: v.id("products"),
      quantity: v.number(),
      variants: v.optional(
        v.array(
          v.object({
            name: v.string(),
            value: v.string(),
          })
        )
      ),
      metadatas: v.optional(
        v.array(
          v.object({
            name: v.string(),
            value: v.union(v.string(), v.number()),
          })
        )
      ),
    })
  ),
  // Shipping Information
  firstName: v.string(),
  lastName: v.string(),
  line1: v.string(),
  line2: v.optional(v.string()),
  state: v.string(),
  city: v.string(),
  zip: v.string(),
  country: v.string(),
  phone: v.string(),
  email: v.string(),
  // terminalFields

  deliveryInfo: v.optional(
    v.object({
      selectedOffering: v.string(),
    })
  ),
  // Additional Information
  storeId: v.id("stores"),
  amount: v.number(),
  shipping: v.number(),
  url: v.optional(v.string()),
  accessCode: v.optional(v.string()),
  reference: v.optional(v.string()),
  status: v.union(v.literal("pending"), v.literal("success"), v.string()),
});

// Packages
export const Packages = Table("packages", {
  name: v.string(),
  width: v.number(),
  height: v.number(),
  length: v.number(),
  weight: v.number(),
  type: v.union(
    v.literal("box"),
    v.literal("envelope"),
    v.literal("soft-packaging")
  ),
  storeId: v.id("stores"),
  terminalPackageId: v.optional(v.string()),
});

export default defineSchema({
  users: Users.table.index("by_tokenIdentifier", ["id"]),
  stores: Stores.table
    .index("by_slug", ["slug"])
    .index("by_owner", ["owner"])
    .index("by_slug_owner", ["slug", "owner"]),
  products: Products.table.index("by_categoryId_storeId", [
    "categoryId",
    "storeId",
  ]),
  categories: Categories.table
    .index("by_storeId", ["storeId"])
    .index("by_parentId_storeId", ["parentId", "storeId"]),
  properties: Properties.table.index("by_storeId", ["storeId"]),
  metadatas: Metadatas.table.index("by_storeId", ["storeId"]),
  metadataPresets: MetadataPresets.table.index("by_storeId", ["storeId"]),
  collections: Collections.table
    .index("by_storeId", ["storeId"])
    .index("by_slug", ["slug"])
    .index("by_storeId_slug", ["storeId", "slug"]),
  collectionsOnProducts: CollectionsOnProducts.table
    .index("by_collectionId_productId", ["collectionId", "productId"])
    .index("by_productId", ["productId"]),
  unitTypes: UnitTypes.table.index("by_storeId", ["storeId"]),
  orders: Orders.table
    .index("by_storeId", ["storeId"])
    .index("by_reference", ["reference"])
    .index("by_storeId_reference", ["storeId", "reference"])
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_slug", ["slug"]),
  packages: Packages.table.index("by_storeId", ["storeId"]),
});

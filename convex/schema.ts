import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Table } from "convex-helpers/server";
import { z } from "zod";

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
  public_metadata: v.object({}),
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
  public_metadata: z.record(z.any()),
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

// Store schema
export const Stores = Table("stores", {
  name: v.string(),
  description: v.string(),
  owner: v.string(),
  slug: v.string(),
});

export default defineSchema({
  users: Users.table.index("by_tokenIdentifier", ["id"]),
  stores: Stores.table
    .index("by_slug", ["slug"])
    .index("by_owner", ["owner"])
    .index("by_slug_owner", ["slug", "owner"]),
});

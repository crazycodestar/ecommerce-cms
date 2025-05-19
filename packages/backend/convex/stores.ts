import { v } from "convex/values";
import { omit } from "es-toolkit";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConflictError, NotFoundError, UnauthorizedError } from "./error";
import { Stores } from "./schema";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifier,
  getTokenIdentifierWithAuthError,
} from "./utils";

export const getMyStore = query({
  handler: async (ctx) => {
    const tokenIdentifier = await getTokenIdentifier(ctx);
    if (!tokenIdentifier) return null;

    const store = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("owner", tokenIdentifier))
      .unique();
    return store;
  },
});

export const getStoreByTokenIdentifier = internalQuery({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: (ctx, { tokenIdentifier }) =>
    getStoreByTokenIdentifierWithAuthError(ctx, tokenIdentifier),
});

export const getStore = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    // if (!userId) throw new ConvexError("No User");
    const tokenIdentifier = await getTokenIdentifier(ctx);
    if (!tokenIdentifier) throw new UnauthorizedError();

    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug_owner", (q) =>
        q.eq("slug", slug).eq("owner", tokenIdentifier)
      )
      .unique();
    if (!store) throw new NotFoundError("Store not found");

    return store;
  },
});

export const getStoreCategories = query({
  handler: async (ctx) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();

    return categories;
  },
});

export const createStoreArgs = omit(Stores.withoutSystemFields, [
  "owner",
  "contents",
  "contentJson",
  "siteUrl",
]);

export const createStore = mutation({
  args: createStoreArgs,

  handler: async (ctx, args) => {
    const tokenIdentifier = await getTokenIdentifier(ctx);
    if (!tokenIdentifier) throw new UnauthorizedError();

    // Check if user already has a store
    const store = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("owner", tokenIdentifier))
      .unique();
    if (store) throw new ConflictError("User already has a store");

    // Check if Slug is already taken
    const existingSlug = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existingSlug) throw new ConflictError("Slug already taken");

    const storeId = await ctx.db.insert("stores", {
      ...args,
      owner: tokenIdentifier,
      contents: [],
    });

    // Add "unit" unit type for store
    await ctx.db.insert("unitTypes", {
      name: "Unit",
      storeId,
    });

    return args.slug;
  },
});

// Create a type utility to change the flag from "required" to "optional"
// type ChangeToOptional<T> = T extends VString<infer U, "required">
//   ? VString<U | undefined, "optional">
//   : T;

// type PartialStoreWithoutSystemFields = {
//   [T in keyof typeof Stores.withoutSystemFields]: ChangeToOptional<(typeof Stores.withoutSystemFields)[T]>;
// }

export const updateStore = mutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    owner: v.optional(v.string()),
    deliveryOptions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
        })
      )
    ),
    // Shipping Information with terminal
    // Payment Information with Paystack
    publicKey: v.optional(v.string()),
    secretKey: v.optional(v.string()),
    slug: v.string(),
  },
  handler: async (ctx, { slug, ...args }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    if (store.slug !== slug)
      throw new UnauthorizedError("Unauthorized to access store");

    return ctx.db.patch(store._id, args);
  },
});

// internal functions

export const getStoreById = internalQuery({
  args: {
    storeId: v.id("stores"),
  },
  handler: (ctx, { storeId }) => ctx.db.get(storeId),
});

export const getStoreBySlug = internalQuery({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) throw new NotFoundError("Store not found");

    return store;
  },
});

export const updateStoreByStoreId = internalMutation({
  args: {
    storeId: v.id("stores"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    owner: v.optional(v.string()),
    // Shipping Information with terminal
    terminalSecretKey: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    line1: v.optional(v.string()),
    line2: v.optional(v.string()),
    zip: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    // Payment Information with Paystack
    publicKey: v.optional(v.string()),
    secretKey: v.optional(v.string()),
    // actions
    siteUrl: v.optional(v.string()),
  },
  handler: (ctx, { storeId, ...args }) => ctx.db.patch(storeId, args),
});

export const getStoreBySlugPublic = query({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) throw new NotFoundError("Store not found");

    return store;
  },
});
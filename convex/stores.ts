import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConflictError, NotFoundError, UnauthorizedError } from "./error";
import { Stores } from "./schema";
import { getTokenIdentifier } from "./utils";
import { omit } from "es-toolkit";

export const getMyStore = query({
  handler: async (ctx) => {
    const tokenIdentifier = await getTokenIdentifier(ctx);
    if (!tokenIdentifier) return null;

    const store = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("owner", tokenIdentifier))
      .unique();
    if (!store) return null;
    return {
      slug: store.slug,
    };
  },
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

export const createStore = mutation({
  args: omit(Stores.withoutSystemFields, ["owner"]),

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
    });

    // Add "unit" unit type for store
    await ctx.db.insert("unitTypes", {
      name: "Unit",
      storeId,
    });

    return args.slug;
  },
});

export const updateStore = mutation({
  args: {
    ...Stores.withoutSystemFields,
    _id: Stores._id,
  },
  handler: async (ctx, { _id, ...args }) => {
    const tokenIdentifier = await getTokenIdentifier(ctx);
    if (!tokenIdentifier) throw new UnauthorizedError();

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("id", tokenIdentifier))
      .unique();
    if (!user) throw new NotFoundError("User not found");

    ctx.db.patch(_id, args);
  },
});

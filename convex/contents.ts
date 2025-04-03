import { pick } from "convex-helpers";
import { mutation, query } from "./_generated/server";
import { Stores } from "./schema";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifierWithAuthError,
} from "./utils";
import { v } from "convex/values";

export const updateContents = mutation({
  args: {
    ...pick(Stores.withoutSystemFields, ["contents"]),
  },
  handler: async (ctx, { contents }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    return ctx.db.patch(store._id, {
      contents,
    });
  },
});

export const getContents = query({
  handler: async (ctx) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    return store.contents;
  },
});

export const generateUploadUrl = mutation(async (ctx) =>
  ctx.storage.generateUploadUrl()
);

export const getImageUrl = query({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, { imageId }) => {
    return ctx.storage.getUrl(imageId);
  },
});

// Public
export const getContentsByStoreSlug = query({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();

    if (!store) {
      return null;
    }

    return store.contents;
  },
});

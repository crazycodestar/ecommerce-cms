import { pick } from "convex-helpers";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Stores } from "./schema";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifierWithAuthError,
} from "./utils";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

export const getCollectionSlugs = query({
  args: {
    collectionIds: v.array(v.id("collections")),
  },
  handler: async (ctx, { collectionIds }) => {
    const collections = await Promise.all(
      collectionIds.map((id) => ctx.db.get(id))
    );
    return collections.filter(Boolean);
  },
});

// http routes

export const apiGetContentsByStoreSlug = internalQuery({
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

export const apiGetImageUrl = internalQuery({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, { imageId }) => {
    return ctx.storage.getUrl(imageId);
  },
});

export const apiGenerateUploadUrl = internalMutation(async (ctx) =>
  ctx.storage.generateUploadUrl()
);

// v2 content json
export const updateContentJson = mutation({
  args: {
    logoId: v.id("_storage"),
    contentJson: v.string(),
  },
  handler: async (ctx, { logoId, contentJson }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    if (!store.siteUrl || store.logoId !== logoId) {
      await ctx.scheduler.runAfter(0, internal.actions.generateSite, {
        storeId: store._id,
        redeploy: store.logoId !== logoId,
      });
    }

    return ctx.db.patch(store._id, {
      contentJson,
      logoId,
    });
  },
});

export const getContentJson = query({
  handler: async (ctx) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    return store.contentJson;
  },
});

export const getContentJsonByStoreSlug = query({
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

    return store.contentJson;
  },
});

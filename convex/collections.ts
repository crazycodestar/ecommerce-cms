import { Table } from "convex-helpers/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { omit } from "convex-helpers";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifierWithAuthError,
} from "./utils";
import { ConflictError, NotFoundError, UnauthorizedError } from "./error";
import { slugify } from "./lib/slugify";

export const Collections = Table("collections", {
  name: v.string(),
  slug: v.string(),
  storeId: v.id("stores"),
});

export const CollectionsOnProducts = Table("collectionsOnProducts", {
  collectionId: v.id("collections"),
  productId: v.id("products"),
});

// Collections
export const createCollections = mutation({
  args: omit(Collections.withoutSystemFields, ["storeId", "slug"]),
  handler: async (ctx, args) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const slug = slugify(args.name);
    const existingCollection = await ctx.db
      .query("collections")
      .withIndex("by_storeId_slug", (q) =>
        q.eq("storeId", store._id).eq("slug", slug)
      )
      .unique();
    if (existingCollection)
      throw new ConflictError("collection already exists");

    return ctx.db.insert("collections", { ...args, storeId: store._id, slug });
  },
});

export const getCollectionsByStoreId = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );
    if (store._id !== storeId)
      throw new UnauthorizedError("Unauthorized access");

    // query
    return ctx.db
      .query("collections")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .collect();
  },
});

export const getCollectionBySlug = query({
  args: {
    slug: Collections.withoutSystemFields.slug,
  },
  handler: async (ctx, { slug }) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    // query
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_storeId_slug", (q) =>
        q.eq("storeId", store._id).eq("slug", slug)
      )
      .unique();
    if (!collection) return null;
    if (collection.storeId !== store._id)
      throw new NotFoundError(`No Collection with slug: ${slug} fround`);

    return collection;
  },
});

export const updateCollections = mutation({
  args: {
    ...omit(Collections.withoutSystemFields, ["storeId", "slug"]),
    collectionId: Collections._id,
  },
  handler: async (ctx, { collectionId, ...args }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    const slug = slugify(args.name);
    const existingCollection = await ctx.db
      .query("collections")
      .withIndex("by_storeId_slug", (q) =>
        q.eq("storeId", store._id).eq("slug", slug)
      )
      .unique();
    if (existingCollection)
      throw new ConflictError("collection already exists");

    return ctx.db.patch(collection._id, { ...args, slug });
  },
});

export const deleteCollections = mutation({
  args: {
    collectionId: Collections._id,
  },
  handler: async (ctx, { collectionId }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    return ctx.db.delete(collection._id);
  },
});

// Collections on Products
export const addProductToCollection = mutation({
  args: {
    productId: v.id("products"),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { productId, collectionId }) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    // assert product is store's
    const product = await ctx.db.get(productId);
    if (!product || product.storeId !== store._id)
      throw new NotFoundError("product not found");

    // assert collection is store's
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    // assert product is not already in collection
    const existingCollectionOnProduct = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id).eq("productId", product._id)
      )
      .unique();
    if (existingCollectionOnProduct)
      throw new ConflictError("product already in collection");

    // mutation
    return ctx.db.insert("collectionsOnProducts", {
      collectionId: collection._id,
      productId: product._id,
    });
  },
});

export const getProductsByCollectionSlug = mutation({
  args: {
    collectionSlug: v.string(),
  },
  handler: async (ctx, { collectionSlug }) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    // assert collection is store's
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_storeId_slug", (q) =>
        q.eq("storeId", store._id).eq("slug", collectionSlug)
      )
      .unique();
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    // query products in collection
    const collectionOnproducts = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id)
      )
      .collect();

    return Promise.all(
      collectionOnproducts.map(async (cop) => {
        const product = await ctx.db.get(cop.productId);
        if (!product) return null;

        const mainImage = await ctx.storage.getUrl(product.images[0]);
        return { ...product, mainImage };
      })
    );
  },
});

export const removeProductFromCollection = mutation({
  args: {
    productId: v.id("products"),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { productId, collectionId }) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    // assert product is store's
    const product = await ctx.db.get(productId);
    if (!product || product.storeId !== store._id)
      throw new NotFoundError("product not found");

    // assert collection is store's
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    // assert product is in collection
    const existingCollectionOnProduct = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id).eq("productId", product._id)
      )
      .unique();
    if (!existingCollectionOnProduct)
      throw new NotFoundError("product not in collection");

    // mutation
    return ctx.db.delete(existingCollectionOnProduct._id);
  },
});

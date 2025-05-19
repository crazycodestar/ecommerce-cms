import { omit } from "convex-helpers";
import { Table } from "convex-helpers/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { ConflictError, NotFoundError } from "./error";
import { slugify } from "./lib/slugify";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifierWithAuthError,
} from "./utils";

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
export const createCollection = mutation({
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
    if (store._id !== storeId) return [];

    // query
    return ctx.db
      .query("collections")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .collect();
  },
});

export const getStoreCollections = query({
  handler: async (ctx) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

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

export const getProductsByCollectionId = query({
  args: {
    collectionId: v.id("collections"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { collectionId, paginationOpts }) => {
    // authorization
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    // assert collection is store's
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    // query products in collection
    const collectionOnproducts = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id)
      )
      .paginate(paginationOpts);

    return {
      ...collectionOnproducts,
      page: await Promise.all(
        collectionOnproducts.page.map(async (cop) => {
          const product = await ctx.db.get(cop.productId);
          if (!product) {
            console.error("product not found (critical): ", product);
            return null;
          }

          const mainImage = await ctx.storage.getUrl(product.images[0]);
          return { ...product, mainImage };
        })
      ),
    };
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

// Public routes

export const getProductsByCollectionIdAndStoreSlug = query({
  args: {
    collectionId: v.id("collections"),
    storeSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { collectionId, paginationOpts, storeSlug }) => {
    // authorization
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    // assert collection is store's
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.storeId !== store._id)
      throw new NotFoundError("collection not found");

    // query products in collection
    const collectionOnproducts = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id)
      )
      .paginate(paginationOpts);

    return {
      ...collectionOnproducts,
      page: await Promise.all(
        collectionOnproducts.page.map(async (cop) => {
          const product = await ctx.db.get(cop.productId);
          if (!product) {
            console.error("product not found (critical): ", product);
            return null;
          }

          const mainImage = await ctx.storage.getUrl(product.images[0]);
          return { ...product, mainImage };
        })
      ),
    };
  },
});

// Public functions

export const getProductsByCollectionSlugAndStoreSlug = query({
  args: {
    collectionSlug: v.string(),
    storeSlug: v.string(),
    properties: v.optional(
      v.array(
        v.object({
          key: v.id("properties"),
          value: v.array(v.string()),
        })
      )
    ),
    // paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { collectionSlug, storeSlug, properties }) => {
    // authorization
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

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
    // FIXME: Re-add pagination and migrate collecions to a one-to-many architecture
    const collectionOnproducts = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id)
      )
      .collect();
    // .paginate(paginationOpts);

    const res = (
      await Promise.all(
        collectionOnproducts.map(async (cop) => {
          const product = await ctx.db.get(cop.productId);
          if (!product) {
            console.error("product not found (critical): ", product);
            return null;
          }

          const mainImage = await ctx.storage.getUrl(product.images[0]);
          return { ...product, mainImage };
        })
      )
    ).filter((cop) => {
      // console.log("properties: ", properties);
      if (!properties) return true;

      return !!properties.every((p) => {
        if (p.value.length === 0) return true;
        // console.log("cop: ", cop);
        const prop = cop?.properties?.find((pp) => pp.propertyId === p.key);
        // console.log("prop: ", prop);
        if (!prop) return false;
        // console.log("typeof", typeof prop?.value);
        if (typeof prop?.value !== "string") return true;

        // console.log("second", cop?.name, !!p.value.includes(prop.value));
        return !!p.value.includes(prop.value);
      });
    });

    return res;
  },
});

export const getCollectionBySlugAndStoreSlug = query({
  args: {
    slug: Collections.withoutSystemFields.slug,
    storeSlug: v.string(),
  },
  handler: async (ctx, { slug, storeSlug }) => {
    // query
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    const collection = await ctx.db
      .query("collections")
      .withIndex("by_storeId_slug", (q) =>
        q.eq("storeId", store._id).eq("slug", slug)
      )
      .unique();
    if (!collection) throw new NotFoundError("collection not found");
    return collection;
  },
});

export const getCollectionsByStoreSlug = query({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) return null;

    return ctx.db
      .query("collections")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .collect();
  },
});

export const getCategoriesByStoreSlug = query({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) return null;

    return ctx.db
      .query("categories")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();
  },
});

export const getProductsByCategoryIdAndStoreSlug = query({
  args: {
    categoryId: v.id("categories"),
    storeSlug: v.string(),
    // paginationOpts: paginationOptsValidator,
    properties: v.optional(
      v.array(
        v.object({
          key: v.id("properties"),
          value: v.array(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, { categoryId, storeSlug, properties }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    const category = await ctx.db.get(categoryId);
    if (!category) throw new NotFoundError("Category Not Found");

    if (category.parentId) {
      const products = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("categoryId"), category._id))
        .order("desc")
        .collect();
      // .paginate(paginationOpts);

      return (
        await Promise.all(
          products.map(async (product) => {
            const mainImage = await ctx.storage.getUrl(product.images[0]);
            return { ...product, mainImage };
          })
        )
      ).filter((cop) => {
        // console.log("properties: ", properties);
        if (!properties) return true;

        return !!properties.every((p) => {
          if (p.value.length === 0) return true;
          // console.log("cop: ", cop);
          const prop = cop?.properties?.find((pp) => pp.propertyId === p.key);
          // console.log("prop: ", prop);
          if (!prop) return false;
          // console.log("typeof", typeof prop?.value);
          if (typeof prop?.value !== "string") return true;

          // console.log("second", cop?.name, !!p.value.includes(prop.value));
          return !!p.value.includes(prop.value);
        });
      });
      // return {
      //   ...products,
      //   page: await Promise.all(
      //     products.page.map(async (product) => {
      //       const mainImage = await ctx.storage.getUrl(product.images[0]);
      //       return { ...product, mainImage };
      //     })
      //   ),
      // };
    }

    const subCategories = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("parentId"), category._id))
      .collect();

    // console.log(subCategories);
    // query products in category
    const products = await ctx.db
      .query("products")
      .filter((q) =>
        q.or(...subCategories.map((sc) => q.eq(q.field("categoryId"), sc._id)))
      )
      .order("desc")
      .collect();
    // .paginate(paginationOpts);

    return (
      await Promise.all(
        products.map(async (product) => {
          const mainImage = await ctx.storage.getUrl(product.images[0]);
          return { ...product, mainImage };
        })
      )
    ).filter((cop) => {
      // console.log("properties: ", properties);
      if (!properties) return true;

      return !!properties.every((p) => {
        if (p.value.length === 0) return true;
        // console.log("cop: ", cop);
        const prop = cop?.properties?.find((pp) => pp.propertyId === p.key);
        // console.log("prop: ", prop);
        if (!prop) return false;
        // console.log("typeof", typeof prop?.value);
        if (typeof prop?.value !== "string") return true;

        // console.log("second", cop?.name, !!p.value.includes(prop.value));
        return !!p.value.includes(prop.value);
      });
    });

    // return {
    //   ...products,
    //   page: await Promise.all(
    //     products.page.map(async (product) => {
    //       const mainImage = await ctx.storage.getUrl(product.images[0]);
    //       return { ...product, mainImage };
    //     })
    //   ),
    // };
  },
});

export const getCategoryByIdAndStoreSlug = query({
  args: {
    categoryId: v.id("categories"),
    storeSlug: v.string(),
  },
  handler: async (ctx, { categoryId, storeSlug }) => {
    // get store
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    // get category
    const category = await ctx.db.get(categoryId);
    if (!category || category.storeId !== store._id)
      throw new NotFoundError("Category not found");

    return category;
  },
});

export const getSubCategoriesByParentIdAndStoreSlug = query({
  args: {
    storeSlug: v.string(),
    parentId: v.id("categories"),
  },
  handler: async (ctx, { storeSlug, parentId }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) return null;

    return ctx.db
      .query("categories")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .filter((q) => q.eq(q.field("parentId"), parentId))
      .collect();
  },
});

export const getFilters = query({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) throw new NotFoundError("Store not found");

    // FIXME: Add categories list as an array in the collection and use that to get the relevant properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .collect();

    return properties;
  },
});

export const apiGetFilters = internalQuery({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) throw new NotFoundError("Store not found");

    // FIXME: Add categories list as an array in the collection and use that to get the relevant properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .collect();

    return properties;
  },
});

export const apiGetCollectionBySlugAndStoreSlug = internalQuery({
  args: {
    slug: Collections.withoutSystemFields.slug,
    storeSlug: v.string(),
  },
  handler: async (ctx, { slug, storeSlug }) => {
    // query
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    const collection = await ctx.db
      .query("collections")
      .withIndex("by_storeId_slug", (q) =>
        q.eq("storeId", store._id).eq("slug", slug)
      )
      .unique();
    if (!collection) throw new NotFoundError("collection not found");
    return collection;
  },
});

export const apiGetProductsByCollectionSlugAndStoreSlug = internalQuery({
  args: {
    collectionSlug: v.string(),
    storeSlug: v.string(),
    properties: v.optional(
      v.array(
        v.object({
          key: v.id("properties"),
          value: v.array(v.string()),
        })
      )
    ),
    // paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { collectionSlug, storeSlug, properties }) => {
    // authorization
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

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
    // FIXME: Re-add pagination and migrate collecions to a one-to-many architecture
    const collectionOnproducts = await ctx.db
      .query("collectionsOnProducts")
      .withIndex("by_collectionId_productId", (q) =>
        q.eq("collectionId", collection._id)
      )
      .collect();
    // .paginate(paginationOpts);

    const res = (
      await Promise.all(
        collectionOnproducts.map(async (cop) => {
          const product = await ctx.db.get(cop.productId);
          if (!product) {
            console.error("product not found (critical): ", product);
            return null;
          }

          const mainImage = await ctx.storage.getUrl(product.images[0]);
          return { ...product, mainImage };
        })
      )
    ).filter((cop) => {
      // console.log("properties: ", properties);
      if (!properties) return true;

      return !!properties.every((p) => {
        if (p.value.length === 0) return true;
        // console.log("cop: ", cop);
        const prop = cop?.properties?.find((pp) => pp.propertyId === p.key);
        // console.log("prop: ", prop);
        if (!prop) return false;
        // console.log("typeof", typeof prop?.value);
        if (typeof prop?.value !== "string") return true;

        // console.log("second", cop?.name, !!p.value.includes(prop.value));
        return !!p.value.includes(prop.value);
      });
    });

    return res;
  },
});

export const apiGetCategoryByIdAndStoreSlug = internalQuery({
  args: {
    categoryId: v.id("categories"),
    storeSlug: v.string(),
  },
  handler: async (ctx, { categoryId, storeSlug }) => {
    // get store
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    // get category
    const category = await ctx.db.get(categoryId);
    if (!category || category.storeId !== store._id)
      throw new NotFoundError("Category not found");

    return category;
  },
});

export const apiGetProductsByCategoryIdAndStoreSlug = internalQuery({
  args: {
    categoryId: v.id("categories"),
    storeSlug: v.string(),
    // paginationOpts: paginationOptsValidator,
    properties: v.optional(
      v.array(
        v.object({
          key: v.id("properties"),
          value: v.array(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, { categoryId, storeSlug, properties }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store)
      throw new NotFoundError(`No Store with slug: ${storeSlug} found`);

    const category = await ctx.db.get(categoryId);
    if (!category) throw new NotFoundError("Category Not Found");

    if (category.parentId) {
      const products = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("categoryId"), category._id))
        .order("desc")
        .collect();
      // .paginate(paginationOpts);

      return (
        await Promise.all(
          products.map(async (product) => {
            const mainImage = await ctx.storage.getUrl(product.images[0]);
            return { ...product, mainImage };
          })
        )
      ).filter((cop) => {
        // console.log("properties: ", properties);
        if (!properties) return true;

        return !!properties.every((p) => {
          if (p.value.length === 0) return true;
          // console.log("cop: ", cop);
          const prop = cop?.properties?.find((pp) => pp.propertyId === p.key);
          // console.log("prop: ", prop);
          if (!prop) return false;
          // console.log("typeof", typeof prop?.value);
          if (typeof prop?.value !== "string") return true;

          // console.log("second", cop?.name, !!p.value.includes(prop.value));
          return !!p.value.includes(prop.value);
        });
      });
      // return {
      //   ...products,
      //   page: await Promise.all(
      //     products.page.map(async (product) => {
      //       const mainImage = await ctx.storage.getUrl(product.images[0]);
      //       return { ...product, mainImage };
      //     })
      //   ),
      // };
    }

    const subCategories = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("parentId"), category._id))
      .collect();

    // console.log(subCategories);
    // query products in category
    const products = await ctx.db
      .query("products")
      .filter((q) =>
        q.or(...subCategories.map((sc) => q.eq(q.field("categoryId"), sc._id)))
      )
      .order("desc")
      .collect();
    // .paginate(paginationOpts);

    return (
      await Promise.all(
        products.map(async (product) => {
          const mainImage = await ctx.storage.getUrl(product.images[0]);
          return { ...product, mainImage };
        })
      )
    ).filter((cop) => {
      // console.log("properties: ", properties);
      if (!properties) return true;

      return !!properties.every((p) => {
        if (p.value.length === 0) return true;
        // console.log("cop: ", cop);
        const prop = cop?.properties?.find((pp) => pp.propertyId === p.key);
        // console.log("prop: ", prop);
        if (!prop) return false;
        // console.log("typeof", typeof prop?.value);
        if (typeof prop?.value !== "string") return true;

        // console.log("second", cop?.name, !!p.value.includes(prop.value));
        return !!p.value.includes(prop.value);
      });
    });
  },
});

export const apiGetCategoriesByStoreSlug = internalQuery({
  args: {
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) return null;

    return ctx.db
      .query("categories")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();
  },
});

export const apiGetSubCategoriesByParentIdAndStoreSlug = internalQuery({
  args: {
    storeSlug: v.string(),
    parentId: v.id("categories"),
  },
  handler: async (ctx, { storeSlug, parentId }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) return null;

    return ctx.db
      .query("categories")
      .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
      .filter((q) => q.eq(q.field("parentId"), parentId))
      .collect();
  },
});

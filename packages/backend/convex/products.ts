import { omit } from "convex-helpers";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import {
  internalQuery,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { defaultUnitTypeName } from "./constants";
import { NotFoundError, UnauthorizedError } from "./error";
import { Categories, Metadatas, Products, UnitTypes } from "./schema";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifier,
  getTokenIdentifierWithAuthError,
} from "./utils";

export const getProductImageUrl = query({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, { imageId }) => {
    return ctx.storage.getUrl(imageId);
  },
});

async function getRichProduct(ctx: QueryCtx, id: Id<"products">) {
  const product = await ctx.db.get(id);
  if (!product)
    throw new ConvexError({
      title: "Not Found",
      message: "No Product Found",
    });

  // FIXME: move into a shared function
  async function getCategoryById(
    parentId: Id<"categories">
  ): Promise<DataModel["categories"]["document"][]> {
    const c = await ctx.db.get(parentId);
    if (!c) return [];
    if (!c.parentId) return [c];

    const cat = await getCategoryById(c.parentId);
    if (!cat) return [c];
    return [c, ...cat];
  }

  const categoryTree = product.categoryId
    ? await getCategoryById(product.categoryId)
    : [];
  const richProduct = {
    ...product,
    imageUrls: await Promise.all(
      product.images.map((image) => ctx.storage.getUrl(image))
    ),
    price: product.price,
    categoryTree,
    properties: product.properties
      ? await Promise.all(
          product.properties.map(async (p) => ({
            ...p,
            property: await ctx.db.get(p.propertyId),
          }))
        )
      : [],
    unit: (await ctx.db.get(product.unitType))?.name,
    variants:
      product.variants &&
      (await Promise.all(
        product.variants.map(async (v) => ({
          ...v,
          options: await Promise.all(
            v.options.map(async (o) => ({
              ...o,
              image: o.imageId
                ? await ctx.storage.getUrl(o.imageId)
                : undefined,
            }))
          ),
        }))
      )),
    // update
    metadatas:
      product.metadataIds &&
      (await Promise.all(
        product.metadataIds.map(async (m) => ({
          _id: m,
          metadata: await ctx.db.get(m),
        }))
      )),
    comment: null,
  };

  return richProduct;
}

export const getProductsByIds = query({
  args: {
    ids: v.array(v.id("products")),
  },
  handler: async (ctx, { ids }) => {
    return Promise.all(ids.map((id) => getRichProduct(ctx, id)));
  },
});

export const getProductById = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, { id }) => {
    const richProduct = await getRichProduct(ctx, id);
    return richProduct;
  },
});

export const getProductsByStoreSlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const store = await ctx.db
      .query("stores")
      .filter((q) => q.eq(q.field("slug"), slug))
      .unique();
    if (!store)
      throw new ConvexError({
        title: "Not Found",
        body: "No store was found with this name",
      });

    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("storeId"), store._id))
      .collect();

    return Promise.all(
      products.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        if (!store) return;

        const owner = await ctx.db
          .query("users")
          .withIndex("by_tokenIdentifier", (q) => q.eq("id", store.owner))
          .unique();
        if (!owner) return;

        const collectionsOnProduct = await ctx.db
          .query("collectionsOnProducts")
          .withIndex("by_productId", (q) => q.eq("productId", product._id))
          .collect();
        const collections = await Promise.all(
          collectionsOnProduct.map(async (c) => {
            const collection = await ctx.db.get(c.collectionId);
            return collection;
          })
        );

        return {
          ...product,
          imageUrls: await Promise.all(
            product.images.map((image) => ctx.storage.getUrl(image))
          ),
          collections,
        };
      })
    );
  },
});

// Mutations
export const generateUploadUrl = mutation(async (ctx) =>
  ctx.storage.generateUploadUrl()
);

export const createProduct = mutation({
  args: Products.withoutSystemFields,
  handler: async (ctx, { storeId, ...product }) => {
    const identity = await getTokenIdentifier(ctx);
    if (!identity) throw new UnauthorizedError();
    // const user = await getUserByTokenIdentifier(ctx);
    // if (!user) throw new ConvexError("No User");

    const store = await ctx.db
      .query("stores")
      .withIndex("by_owner", (q) => q.eq("owner", identity))
      .unique();
    if (!store || store._id !== storeId)
      throw new UnauthorizedError("Unauthorised access");

    // cronjob to add potential new options in each property
    if (product.properties && product.properties.length > 0) {
      ctx.scheduler.runAfter(0, api.products.AddOptionToProperties, {
        // FIXME: Why doesn't it filter out the types that aren't string
        properties: product.properties
          .filter((p) => typeof p.value === "string")
          .map((p) => ({
            propertyId: p.propertyId,
            option: p.value as string,
          })),
      });
    }

    const variants =
      product.variants &&
      (await Promise.all(
        product.variants.map(async (v) => ({
          ...v,
          options: await Promise.all(
            v.options.map(async (o) => {
              return {
                ...o,
                price: o.price,
              };
            })
          ),
        }))
      ));

    ctx.db.insert("products", {
      ...product,
      storeId,
      variants,
    });
  },
});

export const updateProduct = mutation({
  args: {
    ...Products.withoutSystemFields,
    productId: Products._id,
  },
  handler: async (ctx, { productId, storeId, ...product }) => {
    const identity = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(ctx, identity);
    if (store.owner !== identity)
      throw new UnauthorizedError("User not authorized to update store");

    const variants =
      product.variants &&
      (await Promise.all(
        product.variants.map(async (v) => ({
          ...v,
          options: await Promise.all(
            v.options.map(async (o) => {
              return {
                ...o,
                price: o.price,
              };
            })
          ),
        }))
      ));

    ctx.db.patch(productId, {
      ...product,
      storeId,
      variants,
    });
  },
});

export const createProperty = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    type: v.union(v.literal("string"), v.literal("number"), v.literal("array")),
    options: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { categoryId, name, type, options }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );
    return ctx.db.insert("properties", {
      categoryId,
      storeId: store._id,
      name,
      type,
      options,
    });
  },
});

export const AddOptionToProperties = mutation({
  args: {
    properties: v.array(
      v.object({
        propertyId: v.id("properties"),
        option: v.string(),
      })
    ),
  },
  handler: async (ctx, { properties }) => {
    properties.forEach(async (p) => {
      const property = await ctx.db.get(p.propertyId);
      if (!property) return;

      const isNewProperty = !property.options?.includes(p.option);
      if (!isNewProperty) return;

      const options = property.options ?? [];
      return ctx.db.patch(p.propertyId, { options: [...options, p.option] });
    });
  },
});

export const createCategory = mutation({
  args: {
    category: v.object({
      name: v.string(),
      subCategories: v.array(
        v.object({
          name: v.string(),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );
    const categoryId = await ctx.db.insert("categories", {
      storeId: store._id,
      name: args.category.name,
    });

    await Promise.all(
      args.category.subCategories.map(
        async (subCategory) =>
          await ctx.db.insert("categories", {
            storeId: store._id,
            name: subCategory.name,
            parentId: categoryId,
          })
      )
    );
  },
});

export const createSubcategory = mutation({
  args: {
    ...omit(Categories.withoutSystemFields, ["parentId", "storeId"]),
    parentId: v.id("categories"),
  },
  handler: async (ctx, { parentId, ...args }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const category = await ctx.db.get(parentId);
    if (!category) throw new NotFoundError("No Category Found");

    await ctx.db.insert("categories", {
      ...args,
      parentId: category._id,
      storeId: store._id,
    });
  },
});

export const getCategories = query({
  args: {
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, { parentId }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    return ctx.db
      .query("categories")
      .withIndex("by_parentId_storeId", (q) =>
        q.eq("parentId", parentId).eq("storeId", store._id)
      )
      .collect();
  },
});

export const getMetadataById = query({
  args: {
    metadataId: Metadatas._id,
  },
  handler: async (ctx, { metadataId }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const metadata = await ctx.db.get(metadataId);
    if (!metadata) throw new NotFoundError("No Metadata Found");
    if (metadata.storeId !== store._id)
      throw new NotFoundError("No Metadata Found");

    return metadata;
  },
});

export const getMetadatas = query(async (ctx) => {
  const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
  const store = await getStoreByTokenIdentifierWithAuthError(
    ctx,
    tokenIdentifier
  );

  return ctx.db
    .query("metadatas")
    .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
    .collect();
});

export const createMetadata = mutation({
  args: omit(Metadatas.withoutSystemFields, ["storeId"]),
  handler: async (ctx, args) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    return ctx.db.insert("metadatas", {
      ...args,
      storeId: store._id,
    });
  },
});

export const getCategoryTreeById = query({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, { id }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    async function getCategoryById(
      parentId: Id<"categories">
    ): Promise<DataModel["categories"]["document"][] | null> {
      const c = await ctx.db.get(parentId);
      if (!c) return null;
      if (c.storeId !== store._id) return null;
      if (!c.parentId) return [c];

      const cat = await getCategoryById(c.parentId);
      if (!cat) return [c];
      return [c, ...cat];
    }
    return getCategoryById(id);
  },
});

export const getPropertiesByCategoryId = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: (ctx, { categoryId }) => {
    return ctx.db
      .query("properties")
      .filter((q) => q.eq(q.field("categoryId"), categoryId))
      .collect();
  },
});

export const getPropertyById = query({
  args: {
    id: v.id("properties"),
  },
  handler: (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

// Unit Types
export const createUnitType = mutation({
  args: omit(UnitTypes.withoutSystemFields, ["storeId"]),
  handler: async (ctx, { name }) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    return ctx.db.insert("unitTypes", {
      name,
      storeId: store._id,
    });
  },
});

export const getDefaultUnitType = query(async (ctx) => {
  const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
  const store = await getStoreByTokenIdentifierWithAuthError(
    ctx,
    tokenIdentifier
  );

  return ctx.db
    .query("unitTypes")
    .filter((q) => q.eq(q.field("storeId"), store._id))
    .filter((q) => q.eq(q.field("name"), defaultUnitTypeName))
    .unique();
});

export const getUnitTypes = query(async (ctx) => {
  const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
  const store = await getStoreByTokenIdentifierWithAuthError(
    ctx,
    tokenIdentifier
  );

  return ctx.db
    .query("unitTypes")
    .filter((q) => q.eq(q.field("storeId"), store._id))
    .collect();
});

export const getProductByIds = internalQuery({
  args: {
    productIds: v.array(v.id("products")),
  },
  handler: (ctx, { productIds }) =>
    Promise.all(productIds.map((productId) => ctx.db.get(productId))),
});

export const apiGetProductById = internalQuery({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, { id }) => {
    const richProduct = await getRichProduct(ctx, id);
    return richProduct;
  },
});

export const apiGetProductsByIds = internalQuery({
  args: {
    ids: v.array(v.id("products")),
  },
  handler: async (ctx, { ids }) => {
    return Promise.all(ids.map((id) => getRichProduct(ctx, id)));
  },
});

export const apiGetProductsByStoreSlug = internalQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const store = await ctx.db
      .query("stores")
      .filter((q) => q.eq(q.field("slug"), slug))
      .unique();
    if (!store)
      throw new ConvexError({
        title: "Not Found",
        body: "No store was found with this name",
      });

    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("storeId"), store._id))
      .collect();

    return Promise.all(
      products.map(async (product) => {
        const store = await ctx.db.get(product.storeId);
        if (!store) return;

        const owner = await ctx.db
          .query("users")
          .withIndex("by_tokenIdentifier", (q) => q.eq("id", store.owner))
          .unique();
        if (!owner) return;

        const collectionsOnProduct = await ctx.db
          .query("collectionsOnProducts")
          .withIndex("by_productId", (q) => q.eq("productId", product._id))
          .collect();
        const collections = await Promise.all(
          collectionsOnProduct.map(async (c) => {
            const collection = await ctx.db.get(c.collectionId);
            return collection;
          })
        );

        return {
          ...product,
          imageUrls: await Promise.all(
            product.images.map((image) => ctx.storage.getUrl(image))
          ),
          collections,
        };
      })
    );
  },
});

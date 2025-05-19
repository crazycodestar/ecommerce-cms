import { omit, pick } from "convex-helpers";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
  type QueryCtx,
} from "./_generated/server";
import { InternalServerError, NotFoundError } from "./error";
import { Orders } from "./schema";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifierWithAuthError,
} from "./utils";

export const updateOrderPaymentInformation = internalMutation({
  args: {
    ...pick(Orders.withoutSystemFields, ["reference", "accessCode", "url"]),
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId, ...args }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new NotFoundError("order not found");

    return ctx.db.patch(order._id, args);
  },
});

export const updateOrderPaymentStatus = internalMutation({
  args: {
    reference: Orders.withoutSystemFields.reference,
    status: Orders.withoutSystemFields.status,
  },
  handler: async (ctx, { reference, status }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .unique();

    if (!order) throw new NotFoundError("order not found");
    await ctx.db.patch(order._id, {
      status,
    });

    if (status === "success") {
      ctx.scheduler.runAfter(0, internal.email.sendOrderConfirmation, {
        orderId: order._id,
      });
      ctx.scheduler.runAfter(0, internal.email.sendOrderNotification, {
        orderId: order._id,
      });
    }
  },
});

export const createOrder = internalMutation({
  args: {
    ...omit(Orders.withoutSystemFields, [
      "storeId",
      "amount",
      "url",
      "accessCode",
      "reference",
      "status",
      "slug",
    ]),
    storeSlug: v.string(),
  },
  handler: async (ctx, { storeSlug, ...args }) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", storeSlug))
      .unique();
    if (!store) throw new InternalServerError("store not found");

    const items = await Promise.all(
      args.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) throw new InternalServerError("product not found");

        const price =
          product.price +
          (item.variants?.reduce((acc, variant) => {
            const variantSet = product.variants?.find(
              (variantSet) => variantSet.name === variant.name
            );
            const selectedOption = variantSet?.options.find(
              (option) => option.name === variant.value
            );
            return acc + (selectedOption ? selectedOption.price : 0);
          }, 0) ?? 0);

        return {
          ...product,
          price,
          ...item,
        };
      })
    );

    const lastOrderSlug =
      (
        await ctx.db
          .query("orders")
          .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
          .order("desc")
          .first()
      )?.slug ?? "ORD-00000";
    // ORD-12345
    const orderNumber = parseInt(lastOrderSlug.replace("ORD-", ""));
    console.log(typeof orderNumber, orderNumber);
    const slug = "ORD-" + (orderNumber + 1).toString().padStart(5, "0");

    return ctx.db.insert("orders", {
      ...args,
      slug,
      storeId: store._id,
      amount: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      // shipping: 2000,
      status: "pending",
    });
  },
});

export const getOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;

    return getOrderDetails(ctx, order);
  },
});

export const getOrderBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!order) throw new NotFoundError("order not found");

    return order;
  },
});

const getOrderDetails = async (
  ctx: QueryCtx,
  order: DataModel["orders"]["document"]
) => {
  const items = await Promise.all(
    order.items.map(async (item) => {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new InternalServerError("product not found");

      const price =
        product.price +
        (item.variants?.reduce((acc, variant) => {
          const variantSet = product.variants?.find(
            (variantSet) => variantSet.name === variant.name
          );
          const selectedOption = variantSet?.options.find(
            (option) => option.name === variant.value
          );
          return acc + (selectedOption ? selectedOption.price : 0);
        }, 0) ?? 0);

      const imageUrl = await ctx.storage.getUrl(product.images[0]);
      if (!imageUrl)
        throw new InternalServerError("failed to generate imageUrl");

      return {
        ...pick(product, ["name", "price"]),
        price,
        ...item,
        imageUrl,
      };
    })
  );

  return {
    ...order,
    items,
  };
};

export const getOrderByReferenceOrSlug = query({
  args: {
    option: v.union(
      v.object({
        slug: v.string(),
      }),
      v.object({
        reference: v.string(),
      })
    ),
  },
  handler: async (ctx, { option }) => {
    if ("reference" in option) {
      const order = await ctx.db
        .query("orders")
        .withIndex("by_reference", (q) => q.eq("reference", option.reference))
        .unique();

      if (!order) return null;
      return getOrderDetails(ctx, order);
    }

    if ("slug" in option) {
      const order = await ctx.db
        .query("orders")
        .withIndex("by_slug", (q) => q.eq("slug", option.slug))
        .unique();

      if (!order) return null;
      return getOrderDetails(ctx, order);
    }

    return null;
  },
});

export const initializeOrder = action({
  args: {
    ...omit(Orders.withoutSystemFields, [
      "storeId",
      "amount",
      "url",
      "accessCode",
      "reference",
      "status",
      "slug",
    ]),
    storeSlug: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (
    ctx,
    { storeSlug, callbackUrl, ...args }
  ): Promise<{
    accessCode: string;
    url: string;
    slug: string;
  }> => {
    const orderId = await ctx.runMutation(internal.orders.createOrder, {
      storeSlug,
      ...args,
    });
    return ctx.runAction(api.paystack.initializeTransaction, {
      orderId: orderId,
      callbackUrl,
    });
  },
});

export const getMyStoreOrders = query(async (ctx) => {
  const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
  const store = await getStoreByTokenIdentifierWithAuthError(
    ctx,
    tokenIdentifier
  );

  const orders = await ctx.db
    .query("orders")
    .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
    .filter((q) => q.eq(q.field("status"), "success"))
    .collect();

  if (!orders) return null;
  return Promise.all(orders.map((order) => getOrderDetails(ctx, order)));
});

export const apiGetOrderByReferenceOrSlug = internalQuery({
  args: {
    option: v.union(
      v.object({
        slug: v.string(),
      }),
      v.object({
        reference: v.string(),
      })
    ),
  },
  handler: async (ctx: QueryCtx, { option }) => {
    if ("reference" in option) {
      const order = await ctx.db
        .query("orders")
        .withIndex("by_reference", (q) => q.eq("reference", option.reference))
        .unique();

      if (!order) return null;
      return getOrderDetails(ctx, order);
    }

    if ("slug" in option) {
      const order = await ctx.db
        .query("orders")
        .withIndex("by_slug", (q) => q.eq("slug", option.slug))
        .unique();

      if (!order) return null;
      return getOrderDetails(ctx, order);
    }

    return null;
  },
});

export const apiInitializeOrder = internalAction({
  args: {
    ...omit(Orders.withoutSystemFields, [
      "storeId",
      "amount",
      "url",
      "accessCode",
      "reference",
      "status",
      "slug",
    ]),
    storeSlug: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (
    ctx,
    { storeSlug, callbackUrl, ...args }
  ): Promise<{
    accessCode: string;
    url: string;
    slug: string;
  }> => {
    const orderId = await ctx.runMutation(internal.orders.createOrder, {
      storeSlug,
      ...args,
    });
    return ctx.runAction(api.paystack.initializeTransaction, {
      orderId: orderId,
      callbackUrl,
    });
  },
});

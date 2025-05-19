"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { InternalServerError } from "./error";
import { tryCatch } from "./utils";
import { z } from "zod";
import { api, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// const paystackSecretKey = () => {
//   if (!PAYSTACK_SECRET_KEY) {
//     throw new Error("PAYSTACK_SECRET_KEY is not set");
//   }
//   return PAYSTACK_SECRET_KEY;
// };

export const initializeTransaction = action({
  args: {
    orderId: v.id("orders"),
    callbackUrl: v.string(),
  },
  handler: async (
    ctx,
    { callbackUrl, orderId }
  ): Promise<{
    accessCode: string;
    url: string;
    slug: string;
  }> => {
    const order: DataModel["orders"]["document"] | null = await ctx.runQuery(
      api.orders.getOrder,
      {
        orderId,
      }
    );
    if (!order) throw new InternalServerError("order not found");

    const store: DataModel["stores"]["document"] | null = await ctx.runQuery(
      internal.stores.getStoreById,
      {
        storeId: order.storeId,
      }
    );
    if (!store) throw new InternalServerError("store not found");

    const amount = Math.ceil((order.amount + order?.shipping) * 100); // in Kobo
    const secretKey = store.secretKey;
    const { data: response, error } = await tryCatch(
      fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: order.email,
          amount,
          callback_url: callbackUrl,
        }),
      })
    );

    if (error || !response.ok)
      throw new InternalServerError(
        `Failed to initialize transaction: ${error?.message}`
      );

    const formattedResponse = (await response.json()) as {
      status: boolean;
      message: string;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    };

    if (!formattedResponse.status)
      throw new InternalServerError(
        `Failed to initialize transaction: ${formattedResponse.message}`
      );

    await ctx.runMutation(internal.orders.updateOrderPaymentInformation, {
      orderId,
      accessCode: formattedResponse.data.access_code,
      url: formattedResponse.data.authorization_url,
      reference: formattedResponse.data.reference,
    });

    return {
      accessCode: formattedResponse.data.access_code,
      url: formattedResponse.data.authorization_url,
      slug: order.slug,
    };
  },
});

const parsePayload = z.object({
  data: z.object({
    reference: z.string(),
    status: z.union([z.literal("success"), z.string()]),
  }),
});

// validate payments with webhook
export const fulfill = internalAction({
  args: {
    signature: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, { payload }) => {
    const { error, data } = parsePayload.safeParse(payload);
    if (error) console.error(error);

    await ctx.runMutation(internal.orders.updateOrderPaymentStatus, {
      reference: data!.data.reference,
      status: data!.data.status,
    });

    return { success: true };
  },
});

"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { InternalServerError } from "./error";
import { tryCatch } from "./utils";
import { z } from "zod";
import { internal } from "./_generated/api";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// FIXME: get the vendor's paystack secret key from the environment variables
// or from a secure vault
const paystackSecretKey = () => {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return PAYSTACK_SECRET_KEY;
};

export const initializeTransaction = action({
  args: {
    // TODO: collect cart and shipping information
    email: v.string(),
    callbackUrl: v.string(),
  },
  handler: async (_, { email, callbackUrl }) => {
    // TODO: Process cart, shipping, and get total payment amount, and order ID
    // For now, we are just using a fixed amount of 50000
    // and a dummy order ID
    const orderId = "dummy_order_id";
    const amount = 50000;
    const secretKey = paystackSecretKey();
    const { data: response, error } = await tryCatch(
      fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
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

    // TODO: store order payment information in the database
    // TODO: send out order details email to the user
    // {
    //   url: formattedResponse.data.authorization_url,
    //   accessCode: formattedResponse.data.access_code,
    //   reference: formattedResponse.data.reference,
    // }

    return {
      accessCode: formattedResponse.data.access_code,
      url: formattedResponse.data.authorization_url,
      orderId,
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
  handler: async (ctx, { signature, payload }) => {
    const { error, data } = parsePayload.safeParse(payload);
    if (error) console.error(error);

    await ctx.runMutation(internal.orders.updateOrders, {
      reference: data!.data.reference,
      status: data!.data.status,
    });

    return { success: true };
  },
});

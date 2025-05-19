"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import OrderConfirmationEmail from "./email_templates/order_confirmation";
import StoreOwnerNotificationEmail from "./email_templates/store_owner_notification";
import { NotFoundError } from "./error";

const getSiteurl = () => {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  return "localhost:3000";
};
const urlScheme =
  process.env.NODE_ENV === "production" ? "https://" : "http://";

// Define return type for the action
interface EmailResult {
  success: boolean;
  data?: any;
  error?: string;
}

const sendEmail = async ({
  from,
  to,
  subject,
  react,
}: {
  from: string;
  to: string | string[];
  subject: string;
  react: React.JSX.Element;
}): Promise<EmailResult> => {
  // Polyfill for MessageChannel
  if (typeof MessageChannel === "undefined") {
    (global as any).MessageChannel = class MessageChannel {
      port1: any;
      port2: any;
      constructor() {
        this.port1 = {};
        this.port2 = {};
      }
    };
  }

  // Now we can safely import React DOM Server
  const ReactDOMServer = require("react-dom/server");

  try {
    // Initialize Resend with your API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate HTML from React component
    const emailHtml = ReactDOMServer.renderToString(react);

    // Send the email
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// Email component
export const sendOrderConfirmation = internalAction({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const siteUrl = getSiteurl();

    const order = await ctx.runQuery(api.orders.getOrder, { orderId });
    if (!order) throw new NotFoundError("order not found");

    const store = await ctx.runQuery(internal.stores.getStoreById, {
      storeId: order.storeId,
    });
    if (!store) throw new NotFoundError("store not found");

    const { error } = await sendEmail({
      from: `${store.name} <onboarding@resend.dev>`,
      to: order.email,
      subject: "Order Confirmation",
      react: OrderConfirmationEmail({
        amount: order.amount,
        phone: order.phone,
        deliveryAmount: order.shipping,
        email: order.email,
        reference: order.slug,
        status: "pending",
        shippingInformation: {
          address1: order.line1,
          city: order.city,
          firstName: order.firstName,
          lastName: order.lastName,
          zipCode: order.zip,
          address2: order.line2,
        },
        trackingUrl: `${urlScheme}${store.slug}.${siteUrl}/order?slug=${order.slug}`,
        order: order.items.map((item) => ({
          ...item,
          product: {
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
          },
        })),
      }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

export const sendOrderNotification = internalAction({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    const siteUrl = getSiteurl();

    const order = await ctx.runQuery(api.orders.getOrder, { orderId });
    if (!order) throw new NotFoundError("order not found");

    const store = await ctx.runQuery(internal.stores.getStoreById, {
      storeId: order.storeId,
    });
    if (!store) throw new NotFoundError("store not found");

    const { error } = await sendEmail({
      from: `Convertly Tools <onboarding@resend.dev>`,
      to: store.email,
      subject: "New Order",
      react: StoreOwnerNotificationEmail({
        amount: order.amount,
        phone: order.phone,
        deliveryAmount: order.shipping,
        email: order.email,
        reference: order.slug,
        status: "pending",
        shippingInformation: {
          address1: order.line1,
          city: order.city,
          firstName: order.firstName,
          lastName: order.lastName,
          zipCode: order.zip,
          address2: order.line2,
        },
        order: order.items.map((item) => ({
          ...item,
          product: {
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
          },
        })),
        orderDate: new Date(order._creationTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        orderUrl: `${urlScheme}${siteUrl}/dashboard/${store.slug}/orders`,
      }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

import { internalMutation } from "./_generated/server";
import { NotFoundError } from "./error";
import { Orders } from "./schema";

export const updateOrders = internalMutation({
  args: {
    reference: Orders.withoutSystemFields.reference,
    status: Orders.withoutSystemFields.status,
  },
  handler: async (ctx, { reference, status }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .unique();

    if (!order) throw new NotFoundError("transaction not found");
    await ctx.db.patch(order._id, {
      status,
    });

    // TODO: send out order success email to the user and new order email to the vendor
    if (status === "success") return;
  },
});

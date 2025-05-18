import { omit } from "convex-helpers";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Packages } from "./schema";
import {
  getStoreByTokenIdentifierWithAuthError,
  getTokenIdentifierWithAuthError,
} from "./utils";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { BadRequestError } from "./error";

export const createPackage = mutation({
  args: omit(Packages.withoutSystemFields, ["storeId"]),
  handler: async (ctx, args) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    if (store.deliveryInfo.deliveryType !== "terminal") {
      throw new BadRequestError("store is not using terminal");
    }

    const packageId = await ctx.db.insert("packages", {
      ...args,
      storeId: store._id,
    });
    await ctx.scheduler.runAfter(0, api.terminal.createPackaging, {
      packageId,
      terminalSecretKey: store.deliveryInfo.terminalSecretKey,
    });
    return packageId;
  },
});

export const internalGetPackageById = internalQuery({
  args: {
    packageId: v.id("packages"),
  },
  handler: (ctx, { packageId }) => ctx.db.get(packageId),
});

export const updatePackageWithTerminalPackageId = internalMutation({
  args: {
    packageId: v.id("packages"),
    terminalPackageId: v.string(),
  },
  handler: async (ctx, { packageId, terminalPackageId }) => {
    ctx.db.patch(packageId, { terminalPackageId });
  },
});

export const getPackages = query(async (ctx) => {
  const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
  const store = await getStoreByTokenIdentifierWithAuthError(
    ctx,
    tokenIdentifier
  );

  return ctx.db
    .query("packages")
    .withIndex("by_storeId", (q) => q.eq("storeId", store._id))
    .collect();
});
export const getPackageById = query({
  args: { packageId: Packages._id },
  handler: async (ctx, args) => {
    const tokenIdentifier = await getTokenIdentifierWithAuthError(ctx);
    const store = await getStoreByTokenIdentifierWithAuthError(
      ctx,
      tokenIdentifier
    );

    const package_ = await ctx.db.get(args.packageId);
    if (!package_ || package_.storeId !== store._id) {
      throw new Error("Package not found");
    }

    return package_;
  },
});

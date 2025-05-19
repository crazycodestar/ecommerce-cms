import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { clerkClient } from "./context";
import { ConflictError, NotFoundError, UnauthorizedError } from "./error";
import { Users } from "./schema";
import { createStoreArgs } from "./stores";
import { getTokenIdentifier } from "./utils";

export const getCurrentUser = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("id", identity.subject))
    .unique();
});

export const testQuery = query({
  handler: (ctx) => ctx.auth.getUserIdentity(),
});

export const populateUsersFromClerk = internalAction({
  handler: async (ctx) => {
    const users = await clerkClient().users.getUserList();
    await Promise.all(
      users.data.map(async (user) => {
        try {
          await ctx.runMutation(internal.users.createUser, {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username,
            image_url: user.imageUrl,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
            last_sign_in_at: user.lastSignInAt,
            external_id: user.externalId,
            password_enabled: user.passwordEnabled,
            two_factor_enabled: user.twoFactorEnabled,
            primary_email_address_id: user.primaryEmailAddressId,
            email_addresses: user.emailAddresses.map((email) => ({
              id: email.id,
              object: "email_address",
              email_address: email.emailAddress,
              linked_to: email.linkedTo.map((linked) => ({
                id: linked.id,
                type: linked.type,
              })),
              verification: null,
            })),
            primary_phone_number_id: user.primaryPhoneNumberId,
            phone_numbers: user.phoneNumbers,
            primary_web3_wallet_id: user.primaryWeb3WalletId,
            web3_wallets: user.web3Wallets,
            external_accounts: user.externalAccounts.map((account) => ({
              ...account,
              verification: account.verification
                ? {
                    ...account.verification,
                  }
                : null,
            })),
            private_metadata: user.privateMetadata,
            public_metadata: {},
            unsafe_metadata: user.unsafeMetadata,
            object: "user",
          });
        } catch (error) {
          // TODO: Ignore Conflict Errors
          console.error("Error populating users: ", error);
        }
      })
    );

    return "success";
  },
});

export const createUser = internalMutation({
  args: Users.withoutSystemFields,
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("id", args.id))
      .unique();
    if (user) throw new ConflictError("user already exists");

    return ctx.db.insert("users", args);
  },
});

export const updateUser = internalMutation({
  args: Users.withoutSystemFields,
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("id", args.id))
      .unique();
    if (!user) throw new NotFoundError();

    return await ctx.db.patch(user._id, args);
  },
});

// FIXME: Make more robust to delete organization and related messages
export const deleteUser = internalMutation({
  args: {
    deleted: v.boolean(),
    id: v.optional(v.string()),
  },
  handler: async (ctx, { id, deleted }) => {
    if (!deleted) return;
    if (!id) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("id", id))
      .unique();
    if (!user) throw new NotFoundError();

    return await ctx.db.delete(user._id);
  },
});

export const processOnboarding = internalMutation({
  args: createStoreArgs,
  handler: async (ctx, args): Promise<string> => {
    return ctx.runMutation(api.stores.createStore, args);
  },
});

export const submitOnboarding = action({
  args: createStoreArgs,
  handler: async (ctx, args): Promise<string> => {
    const tokenIdentifier = await getTokenIdentifier(ctx);
    if (!tokenIdentifier) throw new UnauthorizedError();

    try {
      const slug = await ctx.runMutation(
        internal.users.processOnboarding,
        args
      );
      await clerkClient().users.updateUser(tokenIdentifier, {
        publicMetadata: {
          onboardingComplete: true,
        },
      });
      return slug;
    } catch (error) {
      console.error("Error processing onboarding: ", error);
      throw error;
    }
  },
});

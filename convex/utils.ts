import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { NotFoundError, UnauthorizedError } from "./error";

export async function getTokenIdentifier(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

export async function getTokenIdentifierWithAuthError(
  ...args: Parameters<typeof getTokenIdentifier>
) {
  const identity = await getTokenIdentifier(...args);
  if (!identity) throw new UnauthorizedError("Unauthorized");
  return identity;
}

export async function getUserByTokenIdentifier(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const tokenIdentifier = identity.subject;

  return ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) => q.eq("id", tokenIdentifier))
    .unique();
}

export async function getUserByTokenIdentifierWithAuthError(
  ...args: Parameters<typeof getUserByTokenIdentifier>
) {
  const user = await getUserByTokenIdentifier(...args);
  if (!user) throw new UnauthorizedError("Unauthorized");
  return user;
}

export async function getStoreByTokenIdentifier(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  return ctx.db
    .query("stores")
    .withIndex("by_owner", (q) => q.eq("owner", tokenIdentifier))
    .unique();
}

export async function getStoreByTokenIdentifierWithAuthError(
  ...args: Parameters<typeof getStoreByTokenIdentifier>
) {
  const store = await getStoreByTokenIdentifier(...args);
  if (!store) throw new NotFoundError("Store not found");
  return store;
}

import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
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

// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}


export const filterUpdated = (obj: any): any => {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const nested = filterUpdated(value);
          if (Object.keys(nested).length > 0) {
            result[key] = nested;
          }
        } else {
          result[key] = value;
        }
      }
      return result;
    };


export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

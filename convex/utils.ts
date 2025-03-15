import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

export async function getTokenIdentifier(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

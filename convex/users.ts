import { query } from "./_generated/server";

export const getCurrentUser = query(async (ctx) => {
  return await ctx.auth.getUserIdentity();
});

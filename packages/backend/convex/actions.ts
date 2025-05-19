import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const generateSite = internalAction({
  args: {
    storeId: v.id("stores"),
    redeploy: v.optional(v.boolean()),
  },
  handler: async (ctx, { storeId, redeploy }) => {
    const store = await ctx.runQuery(internal.stores.getStoreById, {
      storeId,
    });

    if (!store) {
      throw new Error("Store not found");
    }

    if (!store.logoId) {
      throw new Error("Store logo not found");
    }

    // TODO: use imageUrl to generate site
    // const imageUrl = await ctx.storage.getUrl(store.logoId);

    if (redeploy) {
      // TODO: redeploy site to update logo for instance
      return;
    }

    // TODO: Generate site with logo
    // const site = await generateSiteFromContent(logo, store.name);
    // store unique identifier of store
    // const content = JSON.parse(contentJson);
    // TODO: Generate site from content
    // const site = await generateSiteFromContent(content);

    // simulate site generation
    await new Promise((resolve) => setTimeout(resolve, 10000));

    await ctx.runMutation(internal.stores.updateStoreByStoreId, {
      storeId,
      // TODO: replace with the actual generated site url
      siteUrl: "https://convertlykit.com",
    });
  },
});

import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const generateSite = internalAction({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    const store = await ctx.runQuery(internal.stores.getStoreById, {
      storeId,
    });

    if (!store) {
      throw new Error("Store not found");
    }

    const contentJson = store.contentJson;
    if (!contentJson) {
      throw new Error("Content JSON not found");
    }

    const content = JSON.parse(contentJson);
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

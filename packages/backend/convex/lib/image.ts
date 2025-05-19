import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const getImageUrls = async (
  ctx: MutationCtx | QueryCtx,
  imageIds: Id<"_storage">[]
) => {
  return Promise.all(
    imageIds.map(async (imageId) => await ctx.storage.getUrl(imageId))
  );
};

export const getImageUrl = (
  ctx: MutationCtx | QueryCtx,
  imageId: Id<"_storage">
) => ctx.storage.getUrl(imageId);

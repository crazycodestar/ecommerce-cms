import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import { userSchema } from "./schema";
import { z, ZodError } from "zod";

const http = httpRouter();

const userDeleteSchema = z.object({
  deleted: z.boolean(),
  id: z.optional(z.string()),
});

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;
    if (!SIGNING_SECRET) {
      throw new Error(
        "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
      );
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error: Missing Svix headers", {
        status: 400,
      });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent;

    // Verify payload with headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error: Could not verify webhook:", err);
      return new Response("Error: Verification error", {
        status: 400,
      });
    }

    try {
      if (evt.type === "user.created") {
        const data = userSchema.parse(evt.data);
        await ctx.runMutation(internal.users.createUser, data);
      }

      if (evt.type === "user.updated") {
        const data = userSchema.parse(evt.data);
        await ctx.runMutation(internal.users.updateUser, data);
      }

      if (evt.type === "user.deleted") {
        const data = userDeleteSchema.parse(evt.data);
        await ctx.runMutation(internal.users.deleteUser, data);
      }
    } catch (error) {
      if (error instanceof ZodError) console.error("parsing error", error);
      console.error("Error processing webhook event", error);
      return new Response("Webhook received", { status: 200 });
    }
    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;

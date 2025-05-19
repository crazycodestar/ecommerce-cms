import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/backend";
import { userSchema } from "./schema";
import { z, ZodError } from "zod";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

const userDeleteSchema = z.object({
  deleted: z.boolean(),
  id: z.optional(z.string()),
});

const initializeOrderSchema = z.object({
  storeSlug: z.string(),
  callbackUrl: z.string().url(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      variants: z
        .array(
          z.object({
            name: z.string(),
            value: z.string(),
          })
        )
        .optional(),
      metadatas: z
        .array(
          z.object({
            name: z.string(),
            value: z.union([z.string(), z.number()]),
          })
        )
        .optional(),
    })
  ),
  firstName: z.string(),
  lastName: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  state: z.string(),
  city: z.string(),
  zip: z.string(),
  country: z.string(),
  phone: z.string(),
  email: z.string().email(),
  terminalInfo: z.optional(
    z.object({
      rateId: z.string(),
      terminalAddressId: z.string(),
      terminalParcelId: z.string(),
      terminalTrackingNumber: z.string().optional(),
      terminalTrackingUrl: z.string().optional(),
    })
  ),
  customDeliveryInfo: z.optional(
    z.object({
      selectedOffering: z.string(),
    })
  ),
  shipping: z.number(),
});

// Helper function to handle CORS
const handleCORS = (request: Request) => {
  const headers = request.headers;

  console.log("origin", headers.get("Origin"));
  console.log(
    "access-control-request-method",
    headers.get("Access-Control-Request-Method")
  );
  console.log(
    "access-control-request-headers",
    headers.get("Access-Control-Request-Headers")
  );

  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    return new Response(null, {
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      }),
    });
  }
  return new Response();
};

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

http.route({
  path: "/paystack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature: string = request.headers.get(
      "x-paystack-signature"
    ) as string;

    const data = await request.json();
    const result = await ctx.runAction(internal.paystack.fulfill, {
      signature,
      payload: data,
    });
    if (result.success) return new Response(null, { status: 200 });
    return new Response("Webhook Error", { status: 400 });
  }),
});

http.route({
  path: "/api/collections/get-filters",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");

    if (!storeSlug) {
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    const result = await ctx.runQuery(internal.collections.apiGetFilters, {
      storeSlug,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/collections/get-filters",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/collections/get-collection-by-slug-and-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const slug = searchParams.get("slug");

    if (!storeSlug)
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    if (!slug)
      return new Response("Slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(
      internal.collections.apiGetCollectionBySlugAndStoreSlug,
      {
        storeSlug,
        slug,
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/collections/get-collection-by-slug-and-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/collections/get-products-by-collection-slug-and-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const collectionSlug = searchParams.get("collectionSlug");

    if (!storeSlug)
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    if (!collectionSlug)
      return new Response("Collection slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(
      internal.collections.apiGetProductsByCollectionSlugAndStoreSlug,
      {
        storeSlug,
        collectionSlug,
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/collections/get-products-by-collection-slug-and-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/collections/get-category-by-id-and-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const categoryId = searchParams.get("categoryId");

    if (!storeSlug)
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    if (!categoryId)
      return new Response("Category ID is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(
      internal.collections.apiGetCategoryByIdAndStoreSlug,
      {
        storeSlug,
        categoryId: categoryId as Id<"categories">,
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/collections/get-category-by-id-and-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/collections/get-products-by-category-id-and-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const categoryId = searchParams.get("categoryId");
    const properties = searchParams.get("properties");

    if (!storeSlug || !categoryId)
      return new Response("Store slug and category ID are required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(
      internal.collections.apiGetProductsByCategoryIdAndStoreSlug,
      {
        storeSlug,
        categoryId: categoryId as Id<"categories">,
        properties: properties ? JSON.parse(properties) : undefined,
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/collections/get-products-by-category-id-and-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/products/get-product-by-id",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return new Response("Product ID is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(internal.products.apiGetProductById, {
      id: id as Id<"products">,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/products/get-product-by-id",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/categories/get-sub-categories-by-parent-id-and-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const parentId = searchParams.get("parentId");

    if (!storeSlug)
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    if (!parentId)
      return new Response("Parent ID is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(
      internal.collections.apiGetSubCategoriesByParentIdAndStoreSlug,
      {
        storeSlug,
        parentId: parentId as Id<"categories">,
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/categories/get-sub-categories-by-parent-id-and-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/categories/get-categories-by-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");

    if (!storeSlug)
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const result = await ctx.runQuery(
      internal.collections.apiGetCategoriesByStoreSlug,
      {
        storeSlug,
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/categories/get-categories-by-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/delivery/info",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/delivery/info",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("storeSlug");
    if (!slug)
      return new Response("Slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });

    const store = await ctx.runQuery(internal.stores.getStoreBySlug, {
      storeSlug: slug,
    });

    if (!store) {
      return new Response("Store not found", {
        status: 404,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    return new Response(JSON.stringify(store.deliveryOptions), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/orders/get-order-by-reference-or-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const slug = searchParams.get("slug");

    if (!reference && !slug) {
      return new Response("Either reference or slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    const result = await ctx.runQuery(
      internal.orders.apiGetOrderByReferenceOrSlug,
      {
        option: reference ? { reference } : { slug: slug! },
      }
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/orders/get-order-by-reference-or-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/orders/initialize",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const validatedData = initializeOrderSchema.parse(body) as z.infer<
        typeof initializeOrderSchema
      > & {
        items: {
          productId: Id<"products">;
          quantity: number;
          variants?: { value: string; name: string }[];
          metadatas?: { value: string | number; name: string }[];
        }[];
      };

      const result = await ctx.runAction(internal.orders.apiInitializeOrder, {
        ...validatedData,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: "Invalid request data",
            details: error.errors,
          }),
          {
            status: 400,
            headers: new Headers({
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
              Vary: "origin",
            }),
          }
        );
      }
      throw error;
    }
  }),
});

http.route({
  path: "/api/orders/initialize",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/contents/get-contents-by-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storeSlug = url.searchParams.get("storeSlug");

    if (!storeSlug) {
      return new Response(JSON.stringify({ error: "Store slug is required" }), {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    const result = await ctx.runQuery(
      internal.contents.apiGetContentsByStoreSlug,
      {
        storeSlug,
      }
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/contents/get-contents-by-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/contents/get-image-url",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return new Response("Image ID is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    const result = await ctx.runQuery(internal.contents.apiGetImageUrl, {
      imageId: imageId as Id<"_storage">,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/contents/get-image-url",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/products/get-products-by-ids",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",");

    if (!ids || !Array.isArray(ids)) {
      return new Response("Product IDs array is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    const result = await ctx.runQuery(internal.products.apiGetProductsByIds, {
      ids: ids.map((id) => id as Id<"products">),
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/products/get-products-by-ids",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/contents/generate-upload-url",
  method: "POST",
  handler: httpAction(async (ctx) => {
    const result = await ctx.runMutation(
      internal.contents.apiGenerateUploadUrl
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/contents/generate-upload-url",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

http.route({
  path: "/api/products/get-products-by-store-slug",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");

    if (!storeSlug) {
      return new Response("Store slug is required", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
          Vary: "origin",
        }),
      });
    }

    const result = await ctx.runQuery(
      internal.products.apiGetProductsByStoreSlug,
      {
        slug: storeSlug,
      }
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN || "*",
        Vary: "origin",
      }),
    });
  }),
});

http.route({
  path: "/api/products/get-products-by-store-slug",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => handleCORS(request)),
});

export default http;

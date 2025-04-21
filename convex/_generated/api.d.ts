/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as shipping from "../shipping.js";
import type * as http from "../http.js";
import type * as email from "../email.js";
import type * as email_templates_store_owner_notification from "../email_templates/store_owner_notification.js";
import type * as email_templates_order_confirmation from "../email_templates/order_confirmation.js";
import type * as context from "../context.js";
import type * as collections from "../collections.js";
import type * as utils from "../utils.js";
import type * as stores from "../stores.js";
import type * as packages from "../packages.js";
import type * as products from "../products.js";
import type * as orders from "../orders.js";
import type * as lib_image from "../lib/image.js";
import type * as lib_slugify from "../lib/slugify.js";
import type * as paystack from "../paystack.js";
import type * as users from "../users.js";
import type * as terminal from "../terminal.js";
import type * as contents from "../contents.js";
import type * as error from "../error.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  shipping: typeof shipping;
  http: typeof http;
  email: typeof email;
  "email_templates/store_owner_notification": typeof email_templates_store_owner_notification;
  "email_templates/order_confirmation": typeof email_templates_order_confirmation;
  context: typeof context;
  collections: typeof collections;
  utils: typeof utils;
  stores: typeof stores;
  packages: typeof packages;
  products: typeof products;
  orders: typeof orders;
  "lib/image": typeof lib_image;
  "lib/slugify": typeof lib_slugify;
  paystack: typeof paystack;
  users: typeof users;
  terminal: typeof terminal;
  contents: typeof contents;
  error: typeof error;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

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
import type * as actions from "../actions.js";
import type * as collections from "../collections.js";
import type * as constants from "../constants.js";
import type * as contents from "../contents.js";
import type * as context from "../context.js";
import type * as email from "../email.js";
import type * as email_templates_order_confirmation from "../email_templates/order_confirmation.js";
import type * as email_templates_store_owner_notification from "../email_templates/store_owner_notification.js";
import type * as error from "../error.js";
import type * as http from "../http.js";
import type * as lib_image from "../lib/image.js";
import type * as lib_slugify from "../lib/slugify.js";
import type * as orders from "../orders.js";
import type * as packages from "../packages.js";
import type * as paystack from "../paystack.js";
import type * as products from "../products.js";
import type * as stores from "../stores.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  collections: typeof collections;
  constants: typeof constants;
  contents: typeof contents;
  context: typeof context;
  email: typeof email;
  "email_templates/order_confirmation": typeof email_templates_order_confirmation;
  "email_templates/store_owner_notification": typeof email_templates_store_owner_notification;
  error: typeof error;
  http: typeof http;
  "lib/image": typeof lib_image;
  "lib/slugify": typeof lib_slugify;
  orders: typeof orders;
  packages: typeof packages;
  paystack: typeof paystack;
  products: typeof products;
  stores: typeof stores;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

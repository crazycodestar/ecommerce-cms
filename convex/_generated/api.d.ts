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
import type * as collections from "../collections.js";
import type * as context from "../context.js";
import type * as error from "../error.js";
import type * as http from "../http.js";
import type * as lib_slugify from "../lib/slugify.js";
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
  collections: typeof collections;
  context: typeof context;
  error: typeof error;
  http: typeof http;
  "lib/slugify": typeof lib_slugify;
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

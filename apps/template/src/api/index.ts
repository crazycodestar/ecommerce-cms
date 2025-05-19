import { API_ENDPOINTS } from "./endpoints";
import {
  generateUploadUrlResponseSchema,
  getCategoriesByStoreSlugResponseSchema,
  getCategoryByIdAndStoreSlugResponseSchema,
  getCitiesResponseSchema,
  getCollectionBySlugAndStoreSlugResponseSchema,
  getContentsByStoreSlugResponseSchema,
  getFiltersResponseSchema,
  getImageUrlResponseSchema,
  getOrderByReferenceOrSlugResponseSchema,
  getProductByIdResponseSchema,
  getProductsByCategoryIdAndStoreSlugResponseSchema,
  getProductsByCollectionSlugAndStoreSlugResponseSchema,
  getProductsByIdsResponseSchema,
  getProductsByStoreSlugResponseSchema,
  getStatesResponseSchema,
  getSubCategoriesByParentIdAndStoreSlugResponseSchema,
  initializeOrderResponseSchema,
  getDeliveryInfoResponseSchema,
} from "./returnTypes";

export async function fetchAPI<T>(
  endpoint: string,
  options?: {
    method?: "GET" | "POST";
    params?: Record<string, string>;
    body?: Record<string, unknown>;
  }
): Promise<T> {
  const { method = "GET", params, body } = options || {};

  const baseUrl = import.meta.env.VITE_CONVEX_URL!.replace(".cloud", ".site");
  let url = baseUrl + endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }

  // console.log("url -> ", url);
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Collection API functions
export const collectionsAPI = {
  getFilters: (storeSlug: string) =>
    fetchAPI(API_ENDPOINTS.collections.getFilters, {
      params: { storeSlug },
    }).then((data) => getFiltersResponseSchema.parse(data)),

  getCollectionBySlugAndStoreSlug: (storeSlug: string, slug: string) =>
    fetchAPI(API_ENDPOINTS.collections.getCollectionBySlugAndStoreSlug, {
      params: { storeSlug, slug },
    }).then((data) =>
      getCollectionBySlugAndStoreSlugResponseSchema.parse(data)
    ),

  getProductsByCollectionSlugAndStoreSlug: (
    storeSlug: string,
    collectionSlug: string,
    properties?: Record<string, unknown>
  ) =>
    fetchAPI(
      API_ENDPOINTS.collections.getProductsByCollectionSlugAndStoreSlug,
      {
        params: { storeSlug, collectionSlug },
        body: properties,
      }
    ).then((data) =>
      getProductsByCollectionSlugAndStoreSlugResponseSchema.parse(data)
    ),

  getCategoryByIdAndStoreSlug: (storeSlug: string, categoryId: string) =>
    fetchAPI(API_ENDPOINTS.collections.getCategoryByIdAndStoreSlug, {
      params: { storeSlug, categoryId },
    }).then((data) => getCategoryByIdAndStoreSlugResponseSchema.parse(data)),

  getProductsByCategoryIdAndStoreSlug: (
    storeSlug: string,
    categoryId: string,
    properties?: { key: string; value: string[] }[]
  ) =>
    fetchAPI(API_ENDPOINTS.collections.getProductsByCategoryIdAndStoreSlug, {
      params: { storeSlug, categoryId, properties: JSON.stringify(properties) },
    }).then((data) =>
      getProductsByCategoryIdAndStoreSlugResponseSchema.parse(data)
    ),

  getSubCategoriesByParentIdAndStoreSlug: (
    storeSlug: string,
    parentId: string
  ) =>
    fetchAPI(API_ENDPOINTS.collections.getSubCategoriesByParentIdAndStoreSlug, {
      params: { storeSlug, parentId },
    }).then((data) =>
      getSubCategoriesByParentIdAndStoreSlugResponseSchema.parse(data)
    ),

  getCategoriesByStoreSlug: (storeSlug: string) =>
    fetchAPI(API_ENDPOINTS.collections.getCategoriesByStoreSlug, {
      params: { storeSlug },
    }).then((data) => getCategoriesByStoreSlugResponseSchema.parse(data)),
};

// Product API functions
export const productsAPI = {
  getProductById: (id: string) =>
    fetchAPI(API_ENDPOINTS.products.getProductById, {
      params: { id },
    }).then((data) => getProductByIdResponseSchema.parse(data)),

  getProductsByIds: (ids: string[]) =>
    fetchAPI(API_ENDPOINTS.products.getProductsByIds, {
      params: { ids: ids.join(",") },
    }).then((data) => getProductsByIdsResponseSchema.parse(data)),

  getProductsByStoreSlug: (storeSlug: string) =>
    fetchAPI(API_ENDPOINTS.products.getProductsByStoreSlug, {
      params: { storeSlug },
      // }).then((data) => console.log(data)),
    }).then((data) => getProductsByStoreSlugResponseSchema.parse(data)),
};

type ShippingForm = {
  callbackUrl: string;
  storeSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  items: Array<{
    productId: string;
    quantity: number;
    metadatas?: Array<{
      name: string;
      value: string | number;
    }>;
    variants?: Array<{
      name: string;
      value: string;
    }>;
  }>;
  shipping: number;
  deliveryInfo?: {
    selectedOffering: string;
  };
  customDeliveryInfo?: {
    selectedOffering: string;
  };
};

// Order API functions
export const ordersAPI = {
  getOrderByReferenceOrSlug: (reference?: string, slug?: string) =>
    fetchAPI(API_ENDPOINTS.orders.getOrderByReferenceOrSlug, {
      params: reference ? { reference } : slug ? { slug } : undefined,
    }).then((data) => getOrderByReferenceOrSlugResponseSchema.parse(data)),

  initialize: (data: ShippingForm) =>
    fetchAPI(API_ENDPOINTS.orders.initialize, {
      method: "POST",
      body: data,
    }).then((data) => initializeOrderResponseSchema.parse(data)),
};

// Terminal API functions
export const terminalAPI = {
  getStates: () =>
    fetchAPI(API_ENDPOINTS.terminal.getStates).then((data) =>
      getStatesResponseSchema.parse(data)
    ),

  getCities: (stateCode: string) =>
    fetchAPI(API_ENDPOINTS.terminal.getCities, {
      params: { stateCode },
    }).then((data) => getCitiesResponseSchema.parse(data)),
};

// Contents API functions
export const contentsAPI = {
  getContentsByStoreSlug: (storeSlug: string) =>
    fetchAPI(API_ENDPOINTS.contents.getContentsByStoreSlug, {
      params: { storeSlug },
    }).then((data) => getContentsByStoreSlugResponseSchema.parse(data)),

  getImageUrl: (imageId: string) =>
    fetchAPI(API_ENDPOINTS.contents.getImageUrl, {
      params: { imageId },
    }).then((data) => getImageUrlResponseSchema.parse(data)),

  generateUploadUrl: () =>
    fetchAPI(API_ENDPOINTS.contents.generateUploadUrl, {
      method: "POST",
    }).then((data) => generateUploadUrlResponseSchema.parse(data)),
};

// Delivery API functions
export const deliveryAPI = {
  getInfo: (storeSlug: string) =>
    fetchAPI(API_ENDPOINTS.delivery.getInfo, {
      params: { storeSlug },
    }).then((data) => getDeliveryInfoResponseSchema.parse(data)),
};

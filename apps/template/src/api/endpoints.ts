export const API_ENDPOINTS = {
  collections: {
    getFilters: "/api/collections/get-filters",
    getCollectionBySlugAndStoreSlug:
      "/api/collections/get-collection-by-slug-and-store-slug",
    getProductsByCollectionSlugAndStoreSlug:
      "/api/collections/get-products-by-collection-slug-and-store-slug",
    getCategoryByIdAndStoreSlug:
      "/api/collections/get-category-by-id-and-store-slug",
    getProductsByCategoryIdAndStoreSlug:
      "/api/collections/get-products-by-category-id-and-store-slug",
    getSubCategoriesByParentIdAndStoreSlug:
      "/api/categories/get-sub-categories-by-parent-id-and-store-slug",
    getCategoriesByStoreSlug: "/api/categories/get-categories-by-store-slug",
  },
  products: {
    getProductById: "/api/products/get-product-by-id",
    getProductsByIds: "/api/products/get-products-by-ids",
    getProductsByStoreSlug: "/api/products/get-products-by-store-slug",
  },
  orders: {
    getOrderByReferenceOrSlug: "/api/orders/get-order-by-reference-or-slug",
    initialize: "/api/orders/initialize",
  },
  terminal: {
    getStates: "/api/terminal/states",
    getCities: "/api/terminal/cities",
    getRates: "/api/terminal/rates",
  },
  contents: {
    getContentsByStoreSlug: "/api/contents/get-contents-by-store-slug",
    getImageUrl: "/api/contents/get-image-url",
    generateUploadUrl: "/api/contents/generate-upload-url",
  },
  delivery: {
    getInfo: "/api/delivery/info",
  },
} as const;

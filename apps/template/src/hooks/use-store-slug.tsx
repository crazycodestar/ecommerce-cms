export function useStoreSlug() {
  return { storeSlug: import.meta.env.VITE_STORE_SLUG! as string };
}

export const PRODUCT_IMAGES_BUCKET = "product-images";

export function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length).split("?")[0] ?? null;
}

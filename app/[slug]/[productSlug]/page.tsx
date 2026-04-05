import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getPublicSupabase } from "@/lib/supabase/public";
import { BRAND_NAME } from "@/lib/brand";
import { ProductPageClient } from "@/components/storefront/product-page";

type PageProps = {
  params: { slug: string; productSlug: string };
};

async function getStoreAndProduct(storeSlug: string, productSlug: string) {
  const supabase = getPublicSupabase();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, description, whatsapp_number")
    .eq("slug", storeSlug)
    .eq("is_active", true)
    .single();

  if (!store) return null;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("slug", productSlug)
    .eq("is_active", true)
    .single();

  if (!product) return null;

  console.log('product.id:', product.id);

  const { data: productImages, error: imagesError } = await supabase
    .from("product_images")
    .select("id, url, sort_order, variant_id")
    .eq("product_id", product.id);
  console.log('productImages:', productImages, 'imagesError:', imagesError);
  if (imagesError) console.error('Images fetch error:', imagesError);

  const { data: productVariants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, name, price_cents")
    .eq("product_id", product.id)
    .eq("is_active", true);
  if (variantsError) console.error('Variants fetch error:', variantsError);

  const fullProduct = {
    ...product,
    product_images: productImages || [],
    product_variants: productVariants || [],
  };

  console.log('fullProduct:', fullProduct, 'productVariants:', productVariants);
  return { store, product: fullProduct };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, productSlug } = params;
  const data = await getStoreAndProduct(slug, productSlug);

  if (!data) {
    return { title: "Product not found" };
  }

  const { store, product } = data;

  return {
    title: `${product.name} - ${store.name}`,
    description: product.description || `${product.name} from ${store.name} · ${BRAND_NAME}`,
  };
}

export const revalidate = 60; // Cache for 1 minute

export default async function ProductPage({ params }: PageProps) {
  const { slug, productSlug } = params;
  const data = await getStoreAndProduct(slug, productSlug);

  if (!data) {
    notFound();
  }

  const { store, product } = data;

  return <ProductPageClient store={store} product={product} />;
}
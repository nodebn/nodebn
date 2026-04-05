import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Checkout } from "@/components/storefront/checkout";
import { FloatingCart } from "@/components/storefront/floating-cart";
import { ProductGrid } from "@/components/storefront/product-grid";
import { StoreHeader } from "@/components/storefront/store-header";
import { BRAND_NAME } from "@/lib/brand";
import { getPublicSupabase } from "@/lib/supabase/public";
import type { StorefrontProduct } from "@/components/storefront/product-grid";

type PageProps = {
  params: { slug: string };
};

async function getStoreBySlug(slug: string) {
  const supabase = getPublicSupabase();
  const normalized = slug.trim().toLowerCase();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, description, logo_url, whatsapp_number")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[store page]", error.message);
    return null;
  }

  return store;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  category_id: string | null;
  product_images:
    | { url: string; alt_text: string | null; sort_order: number }[]
    | null;
}

function normalizeProduct(row: ProductRow, categoryMap: Record<string, string>, images: { url: string; alt_text: string | null; sort_order: number }[]): StorefrontProduct {
  const categories = row.category_id ? { name: categoryMap[row.category_id] } : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price_cents: row.price_cents,
    currency: row.currency,
    categories,
    product_images: images,
  };
}

async function getCategoriesForStore(storeId: string): Promise<Record<string, string>> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", storeId);

  if (error) {
    console.error("[categories]", error.message);
    return {};
  }

  const map: Record<string, string> = {};
  (data as { id: string; name: string }[] | null)?.forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
}

async function getProductsForStore(storeId: string, categoryMap: Record<string, string>): Promise<StorefrontProduct[]> {
  const supabase = getPublicSupabase();

  // Fetch products
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, description, price_cents, currency, category_id")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("[products]", productsError.message);
    return [];
  }

  if (!productsData || productsData.length === 0) return [];

  // Fetch images for these products
  const productIds = productsData.map(p => p.id);
  const imagesPromises = productIds.map(id =>
    supabase
      .from("product_images")
      .select("product_id, url, alt_text, sort_order")
      .eq("product_id", id)
  );
  const imagesResults = await Promise.all(imagesPromises);
  const imagesData = imagesResults.flatMap(result => result.data || []);
  const imagesError = imagesResults.find(result => result.error)?.error;

  if (imagesError) {
    console.error("[images]", imagesError.message);
  }

  const imagesMap: Record<string, any[]> = {};
  (imagesData || []).forEach(img => {
    if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
    imagesMap[img.product_id].push(img);
  });

  return productsData.map(row => normalizeProduct(row, categoryMap, imagesMap[row.id] || []));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    return { title: "Store not found" };
  }

  return {
    title: store.name,
    description:
      store.description ??
      `${store.name} — shop on WhatsApp · ${BRAND_NAME}`,
  };
}

export const revalidate = 0;

export default async function StorePage({ params }: PageProps) {
  const { slug } = params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const categoryMap = await getCategoriesForStore(store.id);
  const products = await getProductsForStore(store.id, categoryMap);
  const categories = Object.values(categoryMap).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] bg-gradient-to-b from-zinc-100/90 via-[hsl(var(--background))] to-zinc-50/80 dark:from-zinc-950 dark:via-[hsl(var(--background))] dark:to-zinc-950">
      <StoreHeader
        name={store.name}
        description={store.description}
        logo_url={store.logo_url}
      />
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1">
            <h2 className="sr-only">Products</h2>
            <ProductGrid
              storeId={store.id}
              products={products}
              storeSlug={store.slug}
              categories={categories}
            />
          </div>
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[min(100%,380px)]">
            <Checkout
              storeId={store.id}
              storeName={store.name}
              whatsappNumber={store.whatsapp_number ?? ""}
            />
          </aside>
        </div>
      </main>
      <FloatingCart storeId={store.id} />
      <footer className="border-t border-black/[0.06] bg-white/40 py-6 text-center text-xs text-muted-foreground backdrop-blur-sm dark:border-white/[0.08] dark:bg-zinc-950/40">
        Powered by{" "}
        <span className="font-semibold text-foreground">{BRAND_NAME}</span>
      </footer>
    </div>
  );
}

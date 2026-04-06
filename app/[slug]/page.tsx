import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Checkout } from "@/components/storefront/checkout";
import { FloatingCart } from "@/components/storefront/floating-cart";
import { ProductGrid } from "@/components/storefront/product-grid";
import { StoreHeader } from "@/components/storefront/store-header";
import { AuthStatus } from "@/components/auth-status";
import { BRAND_NAME } from "@/lib/brand";
import { getPublicSupabase, getServerSupabase } from "@/lib/supabase/public";
import type { StorefrontProduct } from "@/components/storefront/product-grid";

type PageProps = {
  params: { slug: string };
};

async function getStoreBySlug(slug: string) {
  const supabase = getPublicSupabase();
  const normalized = slug.trim().toLowerCase();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id, name, slug, description, logo_url, whatsapp_number, owner_id")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[store page]", error.message);
    return null;
  }

  return store;
}

async function getSubscriptionForUser(userId: string) {
  const supabase = getServerSupabase();
  const timestamp = Date.now();

  // Log the Supabase URL being used
  console.log(`[${timestamp}] Using Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  // Add timestamp to force fresh query and use single() for error handling
  const { data: subRow, error } = await supabase
    .from("subscriptions")
    .select("plan, status, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  // Debug logging
  if (subRow) {
    console.log(`[${timestamp}] Subscription found for user ${userId}: plan=${subRow.plan}, status=${subRow.status}, updated_at=${subRow.updated_at}`);
  } else {
    console.log(`[${timestamp}] No subscription found for user ${userId}, using free plan. Error: ${error?.message}`);
  }

  return subRow ? { plan: subRow.plan, status: subRow.status } : { plan: 'free', status: 'active' };
}

async function getStoreCounts(storeId: string) {
  const supabase = getServerSupabase();
  // Get counts for the store (only active items)
  const [productsRes, servicesRes, promosRes, categoriesRes, paymentsRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
    supabase.from('services').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
    supabase.from('promo_codes').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
    supabase.from('categories').select('id', { count: 'exact' }).eq('store_id', storeId),
    supabase.from('payments').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
  ]);

  const counts = {
    products: productsRes.count || 0,
    services: servicesRes.count || 0,
    promos: promosRes.count || 0,
    categories: categoriesRes.count || 0,
    payments: paymentsRes.count || 0,
  };

  console.log(`Store ${storeId} counts:`, counts);

  return counts;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  category_id: string | null;
  sort_order: number;
}

function normalizeProduct(row: ProductRow, categoryMap: Record<string, string>, images: { url: string; alt_text: string | null; sort_order: number }[], variants: { id: string; product_id: string; name: string; price_cents: number; is_active: boolean }[]): StorefrontProduct {
  const categories = row.category_id ? { name: categoryMap[row.category_id] } : null;

  return {
    id: row.id,
    name: row.name || 'Unnamed Product',
    slug: row.slug || row.id,
    description: row.description,
    price_cents: row.price_cents ?? 0,
    currency: row.currency || 'BND',
    categories,
    sort_order: row.sort_order ?? 0,
    product_images: images,
    product_variants: variants,
  };
}

async function getCategoriesForStore(storeId: string): Promise<{ id: string; name: string; sort_order: number }[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[categories]", error.message);
    return [];
  }

  return (data as { id: string; name: string; sort_order: number }[]) || [];
}

async function getProductsForStore(storeId: string, categoryMap: Record<string, string>): Promise<StorefrontProduct[]> {
  const supabase = getServerSupabase();

  // Fetch products
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, description, price_cents, currency, category_id, sort_order")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("[products] Query error:", productsError.message);
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

  const imagesMap: Record<string, { url: string; alt_text: string | null; sort_order: number }[]> = {};
  (imagesData || []).forEach(img => {
    if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
    imagesMap[img.product_id].push(img);
  });

  // Fetch variants for these products
  const { data: variantsData, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id, name, price_cents, is_active")
    .in("product_id", productIds)
    .eq("is_active", true);

  if (variantsError) {
    console.error("[variants]", variantsError.message);
  }

  const variantsMap: Record<string, { id: string; product_id: string; name: string; price_cents: number; is_active: boolean }[]> = {};
  (variantsData || []).forEach(v => {
    if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
    variantsMap[v.product_id].push(v);
  });

  const products = productsData.map(row => normalizeProduct(row, categoryMap, imagesMap[row.id] || [], variantsMap[row.id] || []));
  console.log('normalized products:', products.map(p => ({ id: p.id, variants: p.product_variants })));
  return products;
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

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force fresh data on every request

export default async function StorePage({ params }: PageProps) {
  const { slug } = params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const subscription = store.owner_id ? await getSubscriptionForUser(store.owner_id) : { plan: 'free', status: 'active' };
  const counts = await getStoreCounts(store.id);
  const categoryRows = await getCategoriesForStore(store.id);
  const categoryMap = categoryRows.reduce((map, cat) => {
    map[cat.id] = cat.name;
    return map;
  }, {} as Record<string, string>);
  const products = await getProductsForStore(store.id, categoryMap);
  const categories = categoryRows.map(cat => cat.name);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] bg-gradient-to-b from-zinc-100/90 via-[hsl(var(--background))] to-zinc-50/80 dark:from-zinc-950 dark:via-[hsl(var(--background))] dark:to-zinc-950">
      <StoreHeader
        name={store.name}
        description={store.description}
        logo_url={store.logo_url}
      />
      <div className="mx-auto max-w-6xl px-4 py-2 text-center">
        <AuthStatus />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8" style={{ contain: 'layout' }}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1">
            <h2 className="sr-only">Products</h2>
            <ProductGrid
              storeId={store.id}
              products={products}
              storeSlug={store.slug}
            />
          </div>
          <aside id="store-checkout" className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[min(100%,380px)]">
            <Checkout
              storeId={store.id}
              storeName={store.name}
              ownerId={store.owner_id || ''}
              subscription={subscription}
              initialCounts={counts}
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

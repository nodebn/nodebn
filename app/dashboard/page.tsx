import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type {
  DashboardProduct,
  DashboardStore,
  DashboardCategory,
  DashboardService,
  DashboardPromo,
  DashboardPayment,
} from "@/components/dashboard/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();



  if (!user) {
    redirect("/login");
  }

  const { data: storeRow } = await supabase
    .from("stores")
    .select(
      "id, name, slug, whatsapp_number, description, logo_url, is_active",
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  const store = storeRow as DashboardStore | null;

  let products: DashboardProduct[] = [];
  let categories: DashboardCategory[] = [];
  let services: DashboardService[] = [];
  let promos: DashboardPromo[] = [];
  let payments: DashboardPayment[] = [];
  const subscription: { plan: string; status: string } = { plan: 'free', status: 'active' };
  if (store) {
    const { data: rows } = await supabase
      .from("products")
      .select("*, product_images ( id, url, sort_order, variant_id ), categories ( name ), sort_order, created_at")
      .eq("store_id", store.id);

    const productIds = (rows ?? []).map(r => r.id);
    const { data: variantsData } = await supabase
      .from("product_variants")
      .select("id, product_id, name, price_cents, is_active")
      .in("product_id", productIds)
      .eq("is_active", true);

    const variantsMap: Record<string, DashboardProduct["product_variants"]> = {};
    (variantsData ?? []).forEach(v => {
      if (!variantsMap[v.product_id]) variantsMap[v.product_id] = [];
      variantsMap[v.product_id].push(v as DashboardProduct["product_variants"][0]);
    });

    products = (rows ?? []).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description as string | null) ?? null,
      price_cents: row.price_cents as number,
      currency: (row.currency as string) || "USD",
      is_active: Boolean(row.is_active),
      category_id: row.category_id as string | null,
      categories: row.categories as { name: string } | null,
      sort_order: row.sort_order as number | null,
      created_at: row.created_at as string,
      product_images: Array.isArray(row.product_images)
        ? (row.product_images as DashboardProduct["product_images"])
        : [],
      product_variants: variantsMap[row.id] || [],
    }));

    const { data: catRows } = await supabase
      .from("categories")
      .select("id, store_id, name, sort_order")
      .eq("store_id", store.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    categories = (catRows ?? []).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      name: row.name as string,
      sort_order: (row.sort_order as number) || 0,
    }));

    const { data: servRows } = await supabase
      .from("services")
      .select("id, store_id, name, description, fee_cents, is_active")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    services = (servRows ?? []).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      name: row.name as string,
      description: (row.description as string | null) ?? null,
      fee_cents: row.fee_cents as number,
      is_active: Boolean(row.is_active),
    }));

    const { data: promoRows } = await supabase
      .from("promo_codes")
      .select("id, store_id, code, discount_type, value, is_active")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    promos = (promoRows ?? []).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      code: row.code as string,
      discount_type: row.discount_type as "fixed" | "percentage",
      value: row.value as number,
      is_active: Boolean(row.is_active),
    }));

      const { data: paymentRows } = await supabase
      .from("payments")
      .select("id, store_id, bank_name, account_number, account_holder, is_active")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    payments = (paymentRows ?? []).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      bank_name: row.bank_name as string,
      account_number: row.account_number as string,
      account_holder: row.account_holder as string,
      is_active: Boolean(row.is_active),
    }));




  }

  return (
    <DashboardClient
      key={subscription.plan + subscription.status}  // Force re-render on subscription change
      userId={user.id}
      userEmail={user.email ?? ""}
      store={store}
      products={products}
      categories={categories}
      services={services}
      promos={promos}
      payments={payments}
      subscription={subscription}
    />
  );
}

import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type {
  DashboardProduct,
  DashboardStore,
  DashboardCategory,
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
  if (store) {
    const { data: rows } = await supabase
      .from("products")
      .select("*, product_images ( id, url, sort_order ), categories ( name )")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

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
      product_images: Array.isArray(row.product_images)
        ? (row.product_images as DashboardProduct["product_images"])
        : [],
    }));

    const { data: catRows } = await supabase
      .from("categories")
      .select("id, store_id, name")
      .eq("store_id", store.id)
      .order("name");

    categories = (catRows ?? []).map((row) => ({
      id: row.id as string,
      store_id: row.store_id as string,
      name: row.name as string,
    }));
  }

  return (
    <DashboardClient
      userId={user.id}
      userEmail={user.email ?? ""}
      store={store}
      products={products}
      categories={categories}
    />
  );
}

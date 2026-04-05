import type { SupabaseClient } from "@supabase/supabase-js";

export async function storeSlugExists(
  supabase: SupabaseClient,
  slug: string,
): Promise<boolean> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return false;

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[stores] slug lookup failed:", error.message);
    return false;
  }

  return data != null;
}

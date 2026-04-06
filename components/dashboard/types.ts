export type DashboardStore = {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string | null;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
};

export type ProductImageRow = {
  id: string;
  url: string;
  sort_order: number;
  variant_id: string | null;
};

export type DashboardCategory = {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
};

export type DashboardService = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  fee_cents: number;
  is_active: boolean;
};

export type DashboardPromo = {
  id: string;
  store_id: string;
  code: string;
  discount_type: "fixed" | "percentage";
  value: number;
  is_active: boolean;
};

export type DashboardPayment = {
  id: string;
  store_id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string; // e.g. "Small", "Red"
  price_cents: number;
  is_active: boolean;
};

export type DashboardProduct = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  is_active: boolean;
  category_id: string | null;
  categories?: { name: string } | null;
  sort_order: number;
  product_images: ProductImageRow[];
  product_variants: ProductVariant[];
};

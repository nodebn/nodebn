"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { BRAND_NAME } from "@/lib/brand";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateStoreForm } from "@/components/dashboard/create-store-form";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { ProductManager } from "@/components/dashboard/product-manager";
import { CategoryManager } from "@/components/dashboard/category-manager";
import { ServiceManager } from "@/components/dashboard/service-manager";
import { PromoManager } from "@/components/dashboard/promo-manager";
import type {
  DashboardProduct,
  DashboardStore,
  DashboardCategory,
  DashboardService,
  DashboardPromo,
} from "@/components/dashboard/types";

type Props = {
  userId: string;
  userEmail: string;
  store: DashboardStore | null;
  products: DashboardProduct[];
  categories: DashboardCategory[];
  services: DashboardService[];
  promos: DashboardPromo[];
};

export function DashboardClient({
  userId,
  userEmail,
  store,
  products,
  categories,
  services,
  promos,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "settings";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {BRAND_NAME}{" "}
          <span className="font-semibold text-muted-foreground">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {userEmail || "—"}
        </p>
      </div>

      {!store ? (
        <CreateStoreForm ownerId={userId} />
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => router.push(`?tab=${value}`)} className="w-full">
          <TabsList className="grid h-auto w-full max-w-2xl grid-cols-5 p-1">
            <TabsTrigger value="settings">Store settings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="promos">Promos</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="mt-6">
            <StoreSettingsForm store={store} ownerId={userId} />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryManager
              storeId={store.id}
              initialCategories={categories}
              onCategoriesChange={() => {
                // Optionally refresh, but for now, since client-side updates, maybe not needed
              }}
            />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductManager
              storeId={store.id}
              storeSlug={store.slug}
              initialProducts={products}
              categories={categories}
            />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <ServiceManager
              storeId={store.id}
              initialServices={services}
            />
          </TabsContent>
          <TabsContent value="promos" className="mt-6">
            <PromoManager
              storeId={store.id}
              initialPromos={promos}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

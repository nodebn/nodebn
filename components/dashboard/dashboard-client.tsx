"use client";

import { BRAND_NAME } from "@/lib/brand";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateStoreForm } from "@/components/dashboard/create-store-form";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { ProductManager } from "@/components/dashboard/product-manager";
import { CategoryManager } from "@/components/dashboard/category-manager";
import type {
  DashboardProduct,
  DashboardStore,
  DashboardCategory,
} from "@/components/dashboard/types";

type Props = {
  userId: string;
  userEmail: string;
  store: DashboardStore | null;
  products: DashboardProduct[];
  categories: DashboardCategory[];
};

export function DashboardClient({
  userId,
  userEmail,
  store,
  products,
  categories,
}: Props) {
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
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid h-auto w-full max-w-lg grid-cols-3 p-1">
            <TabsTrigger value="settings">Store settings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
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
        </Tabs>
      )}
    </div>
  );
}

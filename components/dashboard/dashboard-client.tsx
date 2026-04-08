"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, memo } from "react";

import { BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { CreateStoreForm } from "@/components/dashboard/create-store-form";
import StoreSettingsForm from "@/components/dashboard/store-settings-form";
import ProductManager from "@/components/dashboard/product-manager";
import CategoryManager from "@/components/dashboard/category-manager";
import ServiceManager from "@/components/dashboard/service-manager";
import PromoManager from "@/components/dashboard/promo-manager";
import PaymentManager from "@/components/dashboard/payment-manager";
import { UpgradeManager } from "@/components/dashboard/upgrade-manager";
import { AuthStatus } from "@/components/auth-status";

// Simple loading component for tab content
const TabLoading = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="text-muted-foreground">Loading...</span>
    </div>
  </div>
));
import type {
  DashboardProduct,
  DashboardStore,
  DashboardCategory,
  DashboardService,
  DashboardPromo,
  DashboardPayment,
} from "@/components/dashboard/types";

type Props = {
  userId: string;
  userEmail: string;
  store: DashboardStore | null;
  products: DashboardProduct[];
  categories: DashboardCategory[];
  services: DashboardService[];
  promos: DashboardPromo[];
  payments: DashboardPayment[];
  subscription: { plan: string; status: string };
  productsCount: number;
};



function DashboardClientComponent({
  userId,
  userEmail,
  store,
  products,
  categories,
  productsCount,
  services,
  promos,
  payments,
  subscription: serverSubscription,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "settings");

  const [tabStates, setTabStates] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    settings: 'idle',
    categories: 'idle',
    products: 'idle',
    services: 'idle',
    promos: 'idle',
    payments: 'idle',
    upgrade: 'idle',
  });

  const handleTabChange = useCallback((value: string) => {
    if (activeTab === value) return; // Don't switch to same tab

    // Set loading state for new tab
    setTabStates(prev => ({ ...prev, [value]: 'loading' }));

    // Switch tab
    setActiveTab(value);
    router.push(`?tab=${value}`);

    // Simulate loading completion (in real app, this would be based on actual data loading)
    setTimeout(() => {
      setTabStates(prev => ({ ...prev, [value]: 'success' }));
      // Reset to idle after success animation
      setTimeout(() => {
        setTabStates(prev => ({ ...prev, [value]: 'idle' }));
      }, 2000);
    }, 600); // Simulate 600ms loading time
  }, [activeTab, router]);

  const [clientSubscription, setClientSubscription] = useState<typeof serverSubscription | null>(null);


  const [counts, setCounts] = useState<{
    products: number;
    services: number;
    promos: number;
    categories: number;
    payments: number;
  }>({ products: 0, services: 0, promos: 0, categories: 0, payments: 0 });




  useEffect(() => {
    // Fetch subscription client-side to ensure fresh data
    const fetchSubscription = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: subRow } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", userId)
        .maybeSingle();

      if (subRow) {
        setClientSubscription({ plan: subRow.plan, status: subRow.status });
      }
    };

    const handleFocus = () => {
      // Re-fetch subscription when window gains focus (user might have completed payment)
      fetchSubscription();
    };

    fetchSubscription();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  useEffect(() => {
    // Check if current usage exceeds subscription limits
    const checkLimits = async () => {
      if (!store?.id) return;

      const supabase = createBrowserSupabaseClient();

      // Fetch current counts
      const [productsRes, servicesRes, promosRes, categoriesRes, paymentsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('services').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('promo_codes').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('categories').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('payments').select('id', { count: 'exact' }).eq('store_id', store.id),
      ]);

      setCounts({
        products: productsRes.count || 0,
        services: servicesRes.count || 0,
        promos: promosRes.count || 0,
        categories: categoriesRes.count || 0,
        payments: paymentsRes.count || 0,
      });
    };

    checkLimits();

    // Listen for upgrade navigation events
    const handleUpgradeNavigation = () => {
      router.push('?tab=upgrade');
    };
    window.addEventListener('navigate-to-upgrade', handleUpgradeNavigation);

    return () => {
      window.removeEventListener('navigate-to-upgrade', handleUpgradeNavigation);
    };
  }, [store?.id, router]);

  const subscription = clientSubscription || serverSubscription;

  const limitExceeded = useMemo(() => {
    if (!clientSubscription) return {};
    const plan = clientSubscription.plan;
    const limits = {
      products: plan === 'free' ? 10 : plan === 'starter' ? 20 : plan === 'professional' ? 100 : Infinity,
      services: plan === 'free' ? 2 : plan === 'starter' ? 5 : plan === 'professional' ? 10 : Infinity,
      promos: plan === 'free' ? 1 : plan === 'starter' ? 3 : plan === 'professional' ? 10 : Infinity,
      categories: plan === 'free' ? 3 : plan === 'starter' ? 5 : plan === 'professional' ? 15 : Infinity,
      payments: plan === 'free' ? 1 : plan === 'starter' ? 2 : plan === 'professional' ? 5 : Infinity,
    };
    return {
      products: counts.products > limits.products,
      services: counts.services > limits.services,
      promos: counts.promos > limits.promos,
      categories: counts.categories > limits.categories,
      payments: counts.payments > limits.payments,
    };
  }, [counts, clientSubscription]);

  const hasExceededLimits = Object.values(limitExceeded).some(exceeded => exceeded);

  return (
    <div className="space-y-6">
      {clientSubscription && hasExceededLimits && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-950 dark:border-red-800">
          <div className="flex items-start gap-3">
            <div className="text-red-600 dark:text-red-400">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Customer Checkout Blocked
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-3">
                Your subscription limits are exceeded. Customers cannot checkout until you resolve this:
              </p>
              <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                {limitExceeded.products && <li>• Products: Remove until ≤ {subscription.plan === 'free' ? 10 : subscription.plan === 'starter' ? 20 : subscription.plan === 'professional' ? 100 : 'unlimited'}</li>}
                {limitExceeded.services && <li>• Services: Remove until ≤ {subscription.plan === 'free' ? 2 : subscription.plan === 'starter' ? 5 : subscription.plan === 'professional' ? 10 : 'unlimited'}</li>}
                {limitExceeded.promos && <li>• Promo codes: Remove until ≤ {subscription.plan === 'free' ? 1 : subscription.plan === 'starter' ? 3 : subscription.plan === 'professional' ? 10 : 'unlimited'}</li>}
                {limitExceeded.categories && <li>• Categories: Remove until ≤ {subscription.plan === 'free' ? 3 : subscription.plan === 'starter' ? 5 : subscription.plan === 'professional' ? 15 : 'unlimited'}</li>}
                {limitExceeded.payments && <li>• Payment methods: Remove until ≤ {subscription.plan === 'free' ? 1 : subscription.plan === 'starter' ? 2 : subscription.plan === 'professional' ? 5 : 'unlimited'}</li>}
              </ul>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-950 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Impact:</strong> Customers visiting your store cannot complete purchases until limits are resolved.
                </p>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard?tab=upgrade">Upgrade Plan</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {BRAND_NAME}{" "}
          <span className="font-semibold text-muted-foreground">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {userEmail || "—"}
        </p>
        <AuthStatus />
        {clientSubscription && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-sm text-muted-foreground">
              Plan: <span className="font-medium text-foreground">
                {clientSubscription.plan.charAt(0).toUpperCase() + clientSubscription.plan.slice(1)}
              </span>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                clientSubscription.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {clientSubscription.status}
              </span>
            </p>
            {clientSubscription.plan !== 'enterprise' && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95 transition-all duration-75 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
                onClick={() => router.push('?tab=upgrade')}
              >
                <span>🚀</span>
                Upgrade
              </Button>
            )}
          </div>
        )}
      </div>

      {!store ? (
        <CreateStoreForm ownerId={userId} />
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" style={{ contain: 'layout' }}>
          <TabsList className="grid h-auto w-full max-w-4xl grid-cols-2 gap-1 p-1 sm:flex sm:flex-wrap sm:overflow-x-auto sm:scrollbar-hide lg:grid-cols-none lg:flex-nowrap">
            <TabsTrigger
              value="settings"
              className={`text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.settings === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.settings === 'success' ? 'border-green-500' :
                tabStates.settings === 'error' ? 'border-red-500' : ''
              }`}
            >
              Store settings
              {tabStates.settings === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.settings === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.settings === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>

            <TabsTrigger
              value="categories"
              className={`text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.categories === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.categories === 'success' ? 'border-green-500' :
                tabStates.categories === 'error' ? 'border-red-500' : ''
              }`}
            >
              Categories
              {tabStates.categories === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.categories === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.categories === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>

            <TabsTrigger
              value="products"
              className={`text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.products === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.products === 'success' ? 'border-green-500' :
                tabStates.products === 'error' ? 'border-red-500' : ''
              }`}
            >
              Products
              {tabStates.products === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.products === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.products === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>

            <TabsTrigger
              value="services"
              className={`text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.services === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.services === 'success' ? 'border-green-500' :
                tabStates.services === 'error' ? 'border-red-500' : ''
              }`}
            >
              Services
              {tabStates.services === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.services === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.services === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>

            <TabsTrigger
              value="promos"
              className={`text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.promos === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.promos === 'success' ? 'border-green-500' :
                tabStates.promos === 'error' ? 'border-red-500' : ''
              }`}
            >
              Promos
              {tabStates.promos === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.promos === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.promos === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>

            <TabsTrigger
              value="payments"
              className={`text-xs sm:text-sm transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.payments === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.payments === 'success' ? 'border-green-500' :
                tabStates.payments === 'error' ? 'border-red-500' : ''
              }`}
            >
              Payments
              {tabStates.payments === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.payments === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.payments === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>

            <TabsTrigger
              value="upgrade"
              className={`text-xs sm:text-sm col-span-2 sm:col-span-1 transition-all duration-200 hover:bg-muted/50 active:scale-95 relative ${
                tabStates.upgrade === 'loading' ? 'border-blue-500 animate-pulse' :
                tabStates.upgrade === 'success' ? 'border-green-500' :
                tabStates.upgrade === 'error' ? 'border-red-500' : ''
              }`}
            >
              Upgrade Plan
              {tabStates.upgrade === 'loading' && <span className="ml-1 text-blue-500">⟳</span>}
              {tabStates.upgrade === 'success' && <span className="ml-1 text-green-500">✓</span>}
              {tabStates.upgrade === 'error' && <span className="ml-1 text-red-500">⚠</span>}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.settings === 'loading' ? <TabLoading /> : (
              <StoreSettingsForm store={store} ownerId={userId} />
            )}
          </TabsContent>
          <TabsContent value="categories" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.categories === 'loading' ? <TabLoading /> : (
              <CategoryManager
                storeId={store.id}
                storeSlug={store.slug}
                initialCategories={categories}
                onCategoriesChange={() => {}}
                subscription={clientSubscription || undefined}
              />
            )}
          </TabsContent>
          <TabsContent value="products" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.products === 'loading' ? <TabLoading /> : (
              <ProductManager
                storeId={store.id}
                storeSlug={store.slug}
                initialProducts={products}
                categories={categories}
                subscription={clientSubscription || undefined}
                productsCount={productsCount}
                onCategoriesChange={() => {}}
              />
            )}
          </TabsContent>
          <TabsContent value="services" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.services === 'loading' ? <TabLoading /> : (
              <ServiceManager
                storeId={store.id}
                initialServices={services}
                subscription={clientSubscription || undefined}
              />
            )}
          </TabsContent>
          <TabsContent value="promos" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.promos === 'loading' ? <TabLoading /> : (
              <PromoManager
                storeId={store.id}
                initialPromos={promos}
                subscription={clientSubscription || undefined}
              />
            )}
          </TabsContent>
          <TabsContent value="payments" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.payments === 'loading' ? <TabLoading /> : (
              <PaymentManager
                storeId={store.id}
                initialPayments={payments}
                subscription={clientSubscription || undefined}
              />
            )}
          </TabsContent>
          <TabsContent value="upgrade" className="mt-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {tabStates.upgrade === 'loading' ? <TabLoading /> : (
              <UpgradeManager subscription={clientSubscription || { plan: 'free', status: 'active' }} />
            )}
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryManager
              storeId={store.id}
              storeSlug={store.slug}
              initialCategories={categories}
              onCategoriesChange={() => {}}
              subscription={clientSubscription || undefined}
            />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductManager
              storeId={store.id}
              storeSlug={store.slug}
              initialProducts={products}
              categories={categories}
              subscription={clientSubscription || undefined}
              productsCount={productsCount}
              onCategoriesChange={() => {}}
            />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <ServiceManager
              storeId={store.id}
              initialServices={services}
              subscription={clientSubscription || undefined}

            />
          </TabsContent>
          <TabsContent value="promos" className="mt-6">
            <PromoManager
              storeId={store.id}
              initialPromos={promos}
              subscription={clientSubscription || undefined}

            />
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <PaymentManager
              storeId={store.id}
              initialPayments={payments}
              subscription={clientSubscription || undefined}

            />
          </TabsContent>
          <TabsContent value="upgrade" className="mt-6">
            <UpgradeManager subscription={subscription} />
          </TabsContent>
        </Tabs>
      )}


    </div>
  );
}

export const DashboardClient = memo(DashboardClientComponent);

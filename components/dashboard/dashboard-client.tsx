"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreateStoreForm } from "@/components/dashboard/create-store-form";
import StoreSettingsForm from "@/components/dashboard/store-settings-form";
import dynamic from "next/dynamic";

const ProductManager = dynamic(() => import("@/components/dashboard/product-manager"));
const CategoryManager = dynamic(() => import("@/components/dashboard/category-manager"));
const ServiceManager = dynamic(() => import("@/components/dashboard/service-manager"));
const PromoManager = dynamic(() => import("@/components/dashboard/promo-manager"));
const PaymentManager = dynamic(() => import("@/components/dashboard/payment-manager"));
const UpgradeManager = dynamic(() => import("@/components/dashboard/upgrade-manager").then(mod => ({ default: mod.UpgradeManager })));
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
};

export function DashboardClient({
  userId,
  userEmail,
  store,
  products,
  categories,
  services,
  promos,
  payments,
  subscription: serverSubscription,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "settings";

  const handleTabChange = useCallback((value: string) => {
    router.push(`?tab=${value}`);
  }, [router]);

  const [clientSubscription, setClientSubscription] = useState(serverSubscription);
  const [limitExceeded, setLimitExceeded] = useState<{
    products: boolean;
    services: boolean;
    promos: boolean;
    categories: boolean;
    payments: boolean;
  }>({ products: false, services: false, promos: false, categories: false, payments: false });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleUpgradeClick = useCallback(() => {
    setUpgradeModalOpen(true);
  }, []);

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

    // Check if current usage exceeds subscription limits
    const checkLimits = async () => {
      if (!store?.id) return;

      const supabase = createBrowserSupabaseClient();
      const plan = clientSubscription.plan;

      // Get limits
      const limits = {
        products: plan === 'free' ? 10 : plan === 'starter' ? 20 : plan === 'professional' ? 100 : Infinity,
        services: plan === 'free' ? 2 : plan === 'starter' ? 5 : plan === 'professional' ? 10 : Infinity,
        promos: plan === 'free' ? 1 : plan === 'starter' ? 3 : plan === 'professional' ? 10 : Infinity,
        categories: plan === 'free' ? 3 : plan === 'starter' ? 5 : plan === 'professional' ? 15 : Infinity,
        payments: plan === 'free' ? 1 : plan === 'starter' ? 2 : plan === 'professional' ? 5 : Infinity,
      };

      // Fetch current counts
      const [productsRes, servicesRes, promosRes, categoriesRes, paymentsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('services').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('promo_codes').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('categories').select('id', { count: 'exact' }).eq('store_id', store.id),
        supabase.from('payments').select('id', { count: 'exact' }).eq('store_id', store.id),
      ]);

      setLimitExceeded({
        products: (productsRes.count || 0) > limits.products,
        services: (servicesRes.count || 0) > limits.services,
        promos: (promosRes.count || 0) > limits.promos,
        categories: (categoriesRes.count || 0) > limits.categories,
        payments: (paymentsRes.count || 0) > limits.payments,
      });
    };

    fetchSubscription();
    checkLimits();

    // Listen for upgrade modal events
    const handleUpgradeModal = () => setUpgradeModalOpen(true);
    window.addEventListener('open-upgrade-modal', handleUpgradeModal);

    return () => {
      window.removeEventListener('open-upgrade-modal', handleUpgradeModal);
    };
  }, [userId, clientSubscription.plan, store?.id]);

  const subscription = clientSubscription;



  const hasExceededLimits = Object.values(limitExceeded).some(exceeded => exceeded);

  return (
    <div className="space-y-6">
      {hasExceededLimits && (
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
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard?tab=upgrade">Upgrade Plan</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${store?.slug || ''}`} target="_blank">View Store</a>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-sm text-muted-foreground">
            Plan: <span className="font-medium text-foreground">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
            </span>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {subscription.status}
            </span>
          </p>
          {subscription.plan !== 'enterprise' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 w-fit"
              onClick={handleUpgradeClick}
            >
              <span>🚀</span>
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {!store ? (
        <CreateStoreForm ownerId={userId} />
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex h-auto w-full max-w-4xl flex-wrap p-1">
            <TabsTrigger value="settings">Store settings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="promos">Promos</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade Plan</TabsTrigger>
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
              subscription={subscription}
            />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductManager
              storeId={store.id}
              storeSlug={store.slug}
              initialProducts={products}
              categories={categories}
              subscription={subscription}
            />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <ServiceManager
              storeId={store.id}
              initialServices={services}
              subscription={subscription}
            />
          </TabsContent>
          <TabsContent value="promos" className="mt-6">
            <PromoManager
              storeId={store.id}
              initialPromos={promos}
              subscription={subscription}
            />
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <PaymentManager
              storeId={store.id}
              initialPayments={payments}
              subscription={subscription}
            />
          </TabsContent>
          <TabsContent value="upgrade" className="mt-6">
            <UpgradeManager subscription={subscription} />
          </TabsContent>
        </Tabs>
      )}

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              🚀 Upgrade Your Plan
            </DialogTitle>
            <DialogDescription className="text-center">
              Unlock more features and grow your business with premium plans
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-950 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 mb-2 dark:text-blue-100">Payment Instructions</h3>
            <p className="text-blue-800 mb-3 dark:text-blue-200">
              All upgrades are processed via bank transfer. Copy the details below after selecting a plan.
            </p>
            <div className="text-left text-sm text-blue-700 space-y-1 dark:text-blue-300">
              <p><strong>Bank:</strong> BIBD</p>
              <p><strong>Account Number:</strong> 00015010066867</p>
              <p><strong>Account Holder:</strong> Cherry Digital Enterprise</p>
            </div>
            <p className="text-blue-800 mt-3 text-sm dark:text-blue-200">
              Send receipts to WhatsApp: <strong>+6738824395</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Free",
                price: "BND 0",
                period: "/month",
                description: "Perfect for getting started",
                features: [
                  "1 store",
                  "10 products",
                  "Basic categories & services",
                  "1 promo code",
                  "1 payment method",
                  "Platform branding",
                  "Email support",
                ],
                cta: "Current Plan",
                popular: false,
              },
              {
                name: "Starter",
                price: "BND 19",
                period: "/month",
                description: "For small businesses",
                features: [
                  "1 store",
                  "20 products",
                  "Categories & services",
                  "3 promo codes",
                  "2 payment methods",
                  "Custom logo",
                  "Email support",
                ],
                cta: "Get Payment Details",
                popular: false,
              },
              {
                name: "Professional",
                price: "BND 49",
                period: "/month",
                description: "Most popular choice",
                features: [
                  "3 stores",
                  "100 products",
                  "Advanced features",
                  "10 promo codes",
                  "5 payment methods",
                  "Priority support",
                  "Bulk operations",
                ],
                cta: "Get Payment Details",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "BND 139",
                period: "/month",
                description: "For growing enterprises",
                features: [
                  "10 stores",
                  "Unlimited products",
                  "All features",
                  "Unlimited promos & payments",
                  "Dedicated support",
                  "Custom integrations",
                  "Advanced analytics",
                ],
                cta: "Get Payment Details",
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative border rounded-lg p-6 ${
                  plan.popular
                    ? "border-blue-500 shadow-lg scale-105 bg-blue-50/50 dark:bg-blue-950/50"
                    : plan.name.toLowerCase() === subscription.plan
                    ? "border-green-500 bg-green-50/50 dark:bg-green-950/50"
                    : "border-gray-200 bg-white dark:bg-gray-800"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                {plan.name.toLowerCase() === subscription.plan && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="text-sm text-gray-500">
                      +{plan.features.length - 6} more features...
                    </li>
                  )}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : plan.name.toLowerCase() === subscription.plan
                      ? "bg-green-600 hover:bg-green-700"
                      : plan.name === "Free"
                      ? "bg-gray-600 hover:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => {
                    if (plan.name === "Free" || plan.name.toLowerCase() === subscription.plan) return;

                    const message = `
Upgrade to ${plan.name} Plan

Amount: ${plan.price}${plan.period}
Bank Transfer Details:
Bank: BIBD
Account Number: 00015010066867
Account Holder: Cherry Digital Enterprise

Instructions:
1. Transfer the amount to the above account
2. Send payment receipt to WhatsApp: +6738824395
3. Include your email and desired plan
4. We'll activate your plan within 24 hours

Thank you for choosing NodeBN!
                    `.trim();

                    navigator.clipboard.writeText(message);
                    alert(`Payment instructions for ${plan.name} copied! Transfer ${plan.price}${plan.period} and send receipt to WhatsApp +6738824395`);
                  }}
                  disabled={plan.name === "Free" || plan.name.toLowerCase() === subscription.plan}
                >
                  {plan.name.toLowerCase() === subscription.plan ? "Current Plan" : plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

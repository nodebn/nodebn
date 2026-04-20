"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from 'next/image';
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useDebounce } from "@/hooks/useDebounce";
import { MessageCircle, Minus, Plus, Trash2, Tag, X } from "lucide-react";

// Simplified checkout - no mobile-specific debugging needed

import { BRAND_NAME } from "@/lib/brand";
import { useCart, type CartLine } from "@/hooks/useCart";
import { formatMoney } from "@/lib/format";
import { getPublicSupabase } from "@/lib/supabase/public";
import { type CustomerDetails } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const BANK_LOGOS: Record<string, string> = {
  'Baiduri Bank': '/images/banks/baiduri.svg',
  'Bank Islam Brunei Darussalam': '/images/banks/bibd.jpg',
  'Standard Chartered Brunei': '/images/banks/scb.png',
  'TAIB': '/images/banks/taib.png',
  'BIBD VCARD': '/images/banks/bibd-vcard.jpg',
  'Cash Upon Delivery': '/images/banks/cod.png',
};

function digitsOnly(whatsappNumber: string) {
  return whatsappNumber.replace(/\D/g, "");
}

/**
 * Builds a WhatsApp-ready order message (Markdown-style bold via *).
 */
export function formatWhatsAppOrderMessage(
  storeName: string,
  cartItems: CartLine[],
  customer: CustomerDetails,
  totalCents: number,
  currency: string,
): string {
  const lines: string[] = [
    "*NEW ORDER*",
    `*Store:* ${storeName}`,
    "",
    "*Customer:*",
    `  • Name: ${customer.name.trim()}`,
    `  • Service: ${customer.address.trim()}`,
    customer.notes.trim() && customer.notes.trim() !== `Service: ${customer.address.trim()}` ? `  • Notes: ${customer.notes.trim()}` : "",
    "",
    "*Items:*",
  ];

  cartItems.forEach((item, index) => {
    const lineTotal = item.price_cents * item.quantity;
    const variantText = item.variant_name ? ` (${item.variant_name})` : '';
    lines.push(
      `  ${index + 1}. ${item.name}${variantText} x${item.quantity} - *${formatMoney(lineTotal, item.currency)}*`,
    );
  });

   lines.push("", `*Total: ${formatMoney(totalCents, currency)}*`, "");
   lines.push("");
   lines.push("*Payment:* After transferring payment, please reply with the receipt screenshot in this chat.", "");
   lines.push("");
   lines.push(`*Powered by ${BRAND_NAME}*`);

  return lines.filter(Boolean).join("\n");
}

/**
 * Encodes the order, opens WhatsApp (same tab) via wa.me, and navigates away.
 */
export function generateWhatsAppLink(
  sellerNumber: string,
  cartItems: CartLine[],
  customer: CustomerDetails,
  storeName: string,
  totalCents: number,
  currency: string,
): void {
  const body = formatWhatsAppOrderMessage(
    storeName,
    cartItems,
    customer,
    totalCents,
    currency,
  );
  const phone = digitsOnly(sellerNumber);
  if (!phone) {
    console.error("[checkout] Invalid WhatsApp number");
    return;
  }
  const encoded = encodeURIComponent(body);

  // Use WhatsApp Web API URL - works in browsers and mobile
  const whatsappUrl = `https://wa.me/${phone}?text=${encoded}`;

  console.log("[checkout] Opening WhatsApp URL:", whatsappUrl);

  // Detect if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // For mobile, use WhatsApp app URL scheme for better compatibility
  const mobileWhatsAppUrl = `whatsapp://send?phone=${phone}&text=${encoded}`;
  const webWhatsAppUrl = whatsappUrl;

  if (isMobile) {
    // On mobile, try WhatsApp app first, fallback to web
    console.log("[checkout] Mobile device detected, trying WhatsApp app");
    setTimeout(() => {
      const appWindow = window.open(mobileWhatsAppUrl, '_blank');
      if (!appWindow) {
        // If popup blocked, use location.href
        window.location.href = mobileWhatsAppUrl;
      }
      // Fallback to web after 2 seconds if app doesn't open
      setTimeout(() => {
        if (document.hasFocus()) { // If still on page, app didn't open
          window.location.href = webWhatsAppUrl;
        }
      }, 2000);
    }, 100);
  } else {
    // On desktop, use web WhatsApp
    try {
      const popup = window.open(webWhatsAppUrl, '_blank', 'noopener,noreferrer');
      if (!popup) {
        // Popup blocked, fallback to same tab
        console.warn("[checkout] Popup blocked, using same tab");
        window.location.href = webWhatsAppUrl;
      }
    } catch (error) {
      // Fallback for any errors
      console.warn("[checkout] Popup failed, using same tab:", error);
      window.location.href = webWhatsAppUrl;
    }
  }
}

type CheckoutProps = {
  storeId: string;
  storeName: string;
  ownerId: string;
  sellerWhatsappNumber: string | null;
  subscription: { plan: string; status: string };
  initialCounts: { products: number; services: number; promos: number; categories: number; payments: number };
};

type Service = {
  id: string;
  name: string;
  description: string;
  fee_cents: number;
};

type Promo = {
  id: string;
  code: string;
  discount_type: "fixed" | "percentage";
  value: number;
};

type PaymentMethod = {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
};

type ProductStockData = {
  stock_quantity: number | null;
  product_variants: { id: string; stock_quantity: number | null }[];
};

const CustomerCard = memo(function CustomerCard({
  name,
  setName,
  whatsappCountry,
  setWhatsappCountry,
  whatsappNumberInput,
  setWhatsappNumberInput,
  validationErrors,
}: {
  name: string;
  setName: (value: string) => void;
  whatsappCountry: string;
  setWhatsappCountry: (value: string) => void;
  whatsappNumberInput: string;
  setWhatsappNumberInput: (value: string) => void;
  validationErrors: string[];
}) {
  return (
    <Card className={cn("rounded-xl bg-white border-gray-200", validationErrors.includes("name") && "border-red-500")} style={{ contain: 'layout' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-normal">Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-name" className="text-sm font-normal">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customer-name"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border-gray-300 text-base min-h-[44px]"
            inputMode="text"
            autoCapitalize="words"
            autoCorrect="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-whatsapp" className="text-sm font-normal">
            WhatsApp number <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Select value={whatsappCountry} onValueChange={setWhatsappCountry}>
              <SelectTrigger className="w-20 rounded-lg border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+673">+673</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="customer-whatsapp"
              name="whatsapp"
              placeholder="Phone number"
              value={whatsappNumberInput}
              onChange={(e) => setWhatsappNumberInput(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 text-gray-500 text-base min-h-[44px]"
              inputMode="tel"
              autoComplete="tel"
              type="tel"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const ItemsCard = memo(function ItemsCard({
  cartForThisStore,
  setQuantity,
  validationErrors,
  productStocks,
}: {
  cartForThisStore: CartLine[];
  setQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  validationErrors: string[];
  productStocks: Record<string, ProductStockData>;
}) {
  const handleDecrease = useCallback((productId: string, quantity: number, variantId?: string | null) => {
    setQuantity(productId, quantity - 1, variantId);
  }, [setQuantity]);

  const handleIncrease = useCallback((productId: string, quantity: number, variantId?: string | null) => {
    const prod = productStocks[productId];
    if (!prod) return;
    const stock = variantId ? (prod.product_variants.find(v => v.id === variantId)?.stock_quantity ?? null) : prod.stock_quantity;
    if (stock !== null && quantity + 1 > stock) {
      alert('Not enough stock for this item');
      return;
    }
    setQuantity(productId, quantity + 1, variantId);
  }, [setQuantity, productStocks]);

  const handleRemove = useCallback((productId: string, variantId?: string | null) => {
    setQuantity(productId, 0, variantId);
  }, [setQuantity]);

  return (
    <Card className={cn("rounded-xl bg-white border-gray-200", validationErrors.includes("items") && "border-red-500")} style={{ contain: 'layout' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-normal">
          Items <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartForThisStore.length === 0 ? (
          <p className="text-sm text-gray-500">No items yet.</p>
        ) : (
          <ul className="space-y-3">
            {cartForThisStore.map((line) => (
              <li key={line.productId + (line.variant_id || '')} className="flex items-center gap-3 rounded-lg border bg-gray-50 px-3 py-3 border-gray-200">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  {line.imageUrl ? (
                    <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">Img</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{line.name}</p>
                  <p className="text-sm text-gray-600">{formatMoney(line.price_cents, line.currency)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded border-gray-300"
                      onClick={handleDecrease.bind(null, line.productId, line.quantity, line.variant_id)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-sm tabular-nums min-w-[2ch] text-center">{line.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded border-gray-300"
                      disabled={
                        (() => {
                          const prod = productStocks[line.productId];
                          if (!prod) return true; // Disable until stock data loads
                          const stock = line.variant_id ? (prod.product_variants.find(v => v.id === line.variant_id)?.stock_quantity ?? null) : prod.stock_quantity;
                          return stock !== null && line.quantity >= stock;
                        })()
                      }
                      onClick={handleIncrease.bind(null, line.productId, line.quantity, line.variant_id)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500"
                  onClick={handleRemove.bind(null, line.productId, line.variant_id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
});

const ServiceCard = memo(function ServiceCard({
  services,
  selectedService,
  setSelectedService,
  validationErrors,
  currency = "BND",
}: {
  services: Service[];
  selectedService: string;
  setSelectedService: (value: string) => void;
  validationErrors: string[];
  currency?: string;
}) {
  return (
    <Card className={cn("rounded-xl bg-white border-gray-200", validationErrors.includes("service") && "border-red-500")} style={{ contain: 'layout' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-normal">
          Service <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          {services.length === 0 ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white cursor-pointer"
                onClick={() => setSelectedService(service.id)}
              >
                <div className="mt-1 w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {selectedService === service.id && <div className="w-2 h-2 rounded-full bg-black"></div>}
                </div>
                <div className="flex-1">
                  <div className="font-normal">{service.name}</div>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  <p className="text-sm font-medium mt-1">{formatMoney(service.fee_cents, currency)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

const PaymentCard = memo(function PaymentCard({
  payments,
  selectedPayment,
  setSelectedPayment,
  validationErrors,
}: {
  payments: PaymentMethod[];
  selectedPayment: string;
  setSelectedPayment: (value: string) => void;
  validationErrors: string[];
}) {
  return (
    <Card className={cn("rounded-xl bg-white border-gray-200", validationErrors.includes("payment") && "border-red-500")} style={{ contain: 'layout' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-normal">
          Payment Method <span className="text-red-500">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {payments.length === 0 ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                  selectedPayment === payment.id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedPayment(payment.id)}
              >
                <div className="mt-1 w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {selectedPayment === payment.id && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {payment.bank_name === 'Cash Upon Delivery' ? '💵' : (
                        <img
                          src={BANK_LOGOS[payment.bank_name]}
                          alt={payment.bank_name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <p className="font-medium">{payment.bank_name}</p>
                    </div>
                  {payment.bank_name !== 'Cash Upon Delivery' && (
                    <>
                      <p className="text-sm text-gray-600">
                        {payment.bank_name === 'BIBD VCARD' ? 'Phone' : 'Account'}: {payment.account_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        Holder: {payment.account_holder}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {selectedPayment && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-800 font-medium mb-2">Payment Instructions:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click &ldquo;Order on WhatsApp&rdquo; below to send order details</li>
              {(() => {
                const payment = payments.find(p => p.id === selectedPayment);
                if (payment?.bank_name === 'Cash Upon Delivery') {
                  return (
                    <>
                      <li>Discuss Delivery fee with seller in the WhatsApp chat</li>
                      <li>Pay in Cash upon delivery to the delivery person</li>
                    </>
                  );
                } else {
                  return (
                    <>
                      <li>
                        {payment?.bank_name === 'BIBD VCARD'
                          ? 'Transfer the amount to the selected VCARD account'
                          : 'Transfer the amount to the selected bank account'
                        }
                      </li>
                      <li>After payment, send receipt screenshot in the WhatsApp chat</li>
                    </>
                  );
                }
              })()}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const SummaryCard = memo(function SummaryCard({
  subtotal,
  serviceFee,
  totalForDisplay,
  currency,
  cartForThisStore,
}: {
  subtotal: number;
  serviceFee: number;
  totalForDisplay: number;
  currency: string;
  cartForThisStore: CartLine[];
}) {
  return (
    <Card className="rounded-xl bg-white border-gray-200" style={{ contain: 'layout' }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Items ({cartForThisStore.reduce((sum, item) => sum + item.quantity, 0)})</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Others</span>
          <span>{formatMoney(0, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>{serviceFee ? 'Service' : 'Service'}</span>
          <span>{formatMoney(serviceFee, currency)}</span>
        </div>
        <div className="border-t border-dotted border-gray-300 my-2"></div>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal + serviceFee, currency)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatMoney(totalForDisplay, currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
});

export const Checkout = memo(function Checkout({
  storeId,
  storeName,
  ownerId,
  sellerWhatsappNumber,
  subscription: serverSubscription,
  initialCounts,
}: CheckoutProps) {
  // Add error state for better error handling
  const [checkoutError] = useState<string | null>(null);

  const { items, storeId: cartStoreId, setQuantity } = useCart();
  const [services, setServices] = useState<Service[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);

  const [name, setName] = useState("");
  const [whatsappCountry, setWhatsappCountry] = useState("+673");
  const [whatsappNumberInput, setWhatsappNumberInput] = useState("");
  const debouncedName = useDebounce(name, 300);
  const debouncedWhatsapp = useDebounce(whatsappNumberInput, 300);
  const [selectedService, setSelectedService] = useState("pickup");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [counts, setCounts] = useState(initialCounts);
  const [subscription, setSubscription] = useState(serverSubscription);
  const [productStocks, setProductStocks] = useState<Record<string, ProductStockData>>({});

  const cartForThisStore = useMemo(() => {
    if (cartStoreId !== storeId) return [];
    return items;
  }, [cartStoreId, storeId, items]);

  // Fetch latest subscription and counts client-side
  useEffect(() => {
    const fetchSubscriptionAndCounts = async () => {
      try {
        const supabase = getPublicSupabase();

        // Fetch latest subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', ownerId)
          .maybeSingle();

        if (subData) {
          setSubscription({ plan: subData.plan, status: subData.status });
        }

        // Fetch latest counts
        const [productsRes, servicesRes, promosRes, categoriesRes, paymentsRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
          supabase.from('services').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
          supabase.from('promo_codes').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
          supabase.from('categories').select('id', { count: 'exact' }).eq('store_id', storeId),
          supabase.from('payments').select('id', { count: 'exact' }).eq('store_id', storeId).eq('is_active', true),
        ]);

        const latestCounts = {
          products: productsRes.count || 0,
          services: servicesRes.count || 0,
          promos: promosRes.count || 0,
          categories: categoriesRes.count || 0,
          payments: paymentsRes.count || 0,
        };

        setCounts(latestCounts);
      } catch (error) {
        console.error('Failed to fetch latest subscription and counts:', error);
      }
    };

    const handleFocus = () => {
      // Force page reload to get fresh server data when window gains focus
      // This ensures subscription changes are reflected immediately
      window.location.reload();
    };

    fetchSubscriptionAndCounts();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [storeId, ownerId]);

  // subscription is now managed by state with client-side fetching


  useEffect(() => {
    const fetchServices = async () => {
      const supabase = getPublicSupabase();
      const { data } = await supabase
        .from("services")
        .select("id, name, description, fee_cents")
        .eq("store_id", storeId)
        .eq("is_active", true);
      setServices(data || []);
    };
    const fetchPromos = async () => {
      const supabase = getPublicSupabase();
      const { data } = await supabase
        .from("promo_codes")
        .select("id, code, discount_type, value")
        .eq("store_id", storeId)
        .eq("is_active", true);
      setPromos(data || []);
    };
    const fetchPayments = async () => {
      const supabase = getPublicSupabase();
      const { data } = await supabase
        .from("payments")
        .select("id, bank_name, account_number, account_holder")
        .eq("store_id", storeId)
        .eq("is_active", true);
      setPayments(data || []);
    };
    fetchServices();
    fetchPromos();
    fetchPayments();

    // Prevent page refresh on iPad keyboard hide (potential issue)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target as HTMLElement).matches('input, textarea, select')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [storeId]);

  // Fetch product stock data for inventory validation
  useEffect(() => {
    const productIds = Array.from(new Set(cartForThisStore.map(item => item.productId)));
    if (productIds.length === 0) return;

    const fetchStocks = async () => {
      const supabase = getPublicSupabase();
      const { data } = await supabase
        .from('products')
        .select('id, stock_quantity, product_variants(id, stock_quantity)')
        .in('id', productIds)
        .eq('is_active', true);
      const stocks: Record<string, ProductStockData> = {};
      data?.forEach(product => {
        stocks[product.id] = {
          stock_quantity: product.stock_quantity,
          product_variants: product.product_variants,
        };
      });
      setProductStocks(stocks);
    };

    fetchStocks();
  }, [cartForThisStore]);

  useEffect(() => {
    // Check limits using the subscription and counts passed from server
    const plan = subscription.plan;
    const limits = {
      products: plan === 'free' ? 25 : plan === 'starter' ? 50 : plan === 'professional' ? 100 : Infinity,
      services: plan === 'free' ? 2 : plan === 'starter' ? 5 : plan === 'professional' ? 10 : Infinity,
      promos: plan === 'free' ? 1 : plan === 'starter' ? 3 : plan === 'professional' ? 10 : Infinity,
      categories: plan === 'free' ? 5 : plan === 'starter' ? 15 : plan === 'professional' ? 30 : Infinity,
      payments: plan === 'free' ? 1 : plan === 'starter' ? 2 : plan === 'professional' ? 5 : Infinity,
    };

    const exceeded = counts.products > limits.products ||
                      counts.services > limits.services ||
                      counts.promos > limits.promos ||
                      counts.categories > limits.categories ||
                      counts.payments > limits.payments;

    console.log(`Checkout limit check: plan=${plan}, limits=`, limits, `counts=`, counts, `exceeded=${exceeded}`);

    setLimitExceeded(exceeded);
  }, [subscription.plan, counts]);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const serviceFee = selectedServiceData ? selectedServiceData.fee_cents : 0;

  const subtotal = useMemo(
    () =>
      cartForThisStore.reduce(
        (sum, line) => sum + line.price_cents * line.quantity,
        0,
      ),
    [cartForThisStore],
  );

  const totalForDisplay = subtotal + serviceFee - appliedDiscount;

  const currency = cartForThisStore[0]?.currency ?? "BND";

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    const promo = promos.find(p => p.code.toUpperCase() === code);
    if (!promo) {
      alert("Invalid promo code");
      return;
    }
    let discount = 0;
    if (promo.discount_type === "fixed") {
      discount = promo.value * 100; // value in BND to cents
    } else if (promo.discount_type === "percentage") {
      discount = Math.round(subtotal * (promo.value / 100.0));
    }
    setAppliedDiscount(discount);
    setPromoApplied(true);
  };

  const removePromo = () => {
    setPromoCode("");
    setAppliedDiscount(0);
    setPromoApplied(false);
  };



  const canSubmit =
    cartForThisStore.length > 0 &&
    debouncedName.trim().length > 0 &&
    debouncedWhatsapp.trim().length > 0 &&
    selectedService &&
    selectedPayment &&
    !limitExceeded;

  const handleCheckout = async () => {
    // SIMPLIFIED: Remove all mobile-specific logic that might cause issues
    // Just do the basic checkout flow that works on both mobile and desktop

    try {
      const errors: string[] = [];
      if (!name.trim()) errors.push("name");
      if (!whatsappNumberInput.trim()) errors.push("whatsapp");
      if (!selectedService || !services.find(s => s.id === selectedService)) errors.push("service");
      if (!selectedPayment || !payments.find(p => p.id === selectedPayment)) errors.push("payment");
      setValidationErrors(errors);

      if (!canSubmit || errors.length > 0) return;

      setIsSubmitting(true);
      setError(null);

      const selectedServiceData = services.find(s => s.id === selectedService);
      const customer: CustomerDetails = {
        name: debouncedName.trim(),
        address: `${selectedServiceData?.name || "Service"}`,
        notes: `Service: ${selectedServiceData?.name || selectedService}`,
      };

      const whatsappMessage = formatWhatsAppOrderMessage(
        storeName,
        cartForThisStore,
        customer,
        totalForDisplay,
        currency,
      );

      // CRITICAL FIX: Simplified approach - create order AND deduct stock in one call
      // This prevents any timing issues between mobile and desktop
      console.log('🛒 Starting simplified checkout...');

      // Use a single server action that handles both order creation and stock deduction
      const result = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          cartItems: cartForThisStore,
          customer,
          totalCents: totalForDisplay,
          currency,
          whatsappMessage,
          selectedPayment,
        }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const data = await result.json();
      console.log('✅ Checkout successful:', data);

      // Open WhatsApp after successful checkout
      if (!sellerWhatsappNumber || sellerWhatsappNumber.trim() === '') {
        alert('Seller WhatsApp number not available. Please contact the seller directly.');
        return;
      }
      setTimeout(() => {
        generateWhatsAppLink(sellerWhatsappNumber, cartForThisStore, customer, storeName, totalForDisplay, currency);
      }, 500);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Checkout Error</h3>
          <p className="text-red-600 mb-4">
            There was a problem processing your order. This is often due to mobile browser behavior.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {cartStoreId !== null && cartStoreId !== storeId && items.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            Your cart is for another store. Add items here to start a new order.
          </div>
        ) : null}

      <form onSubmit={(e) => e.preventDefault()}>
        <CustomerCard
          name={name}
          setName={setName}
          whatsappCountry={whatsappCountry}
          setWhatsappCountry={setWhatsappCountry}
          whatsappNumberInput={whatsappNumberInput}
          setWhatsappNumberInput={setWhatsappNumberInput}
          validationErrors={validationErrors}
        />

        <ItemsCard
          cartForThisStore={cartForThisStore}
          setQuantity={setQuantity}
          validationErrors={validationErrors}
          productStocks={productStocks}
        />

        <ServiceCard
          services={services}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          validationErrors={validationErrors}
          currency={currency}
        />

        <PaymentCard
          payments={payments}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          validationErrors={validationErrors}
        />
      </form>

      {/* Promo Code Card */}
      <Card className="rounded-xl bg-white border-gray-200 border-t-2" style={{ contain: 'layout' }}>
        <Accordion type="single" collapsible>
          <AccordionItem value="promo">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Tag className="size-5 text-gray-400" />
                <span className="text-lg font-normal">Promo code</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              {promoApplied ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{promoCode.toUpperCase()} applied</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">-{formatMoney(appliedDiscount, currency)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                      onClick={removePromo}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="rounded-lg border-gray-300 text-base min-h-[44px]"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                  />
                  <Button
                    variant="outline"
                    className="rounded-lg border-gray-300"
                    onClick={applyPromo}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <div className="flex flex-col gap-4 pb-16">
        <SummaryCard
          subtotal={subtotal}
          serviceFee={serviceFee}
          totalForDisplay={totalForDisplay}
          currency={currency}
          cartForThisStore={cartForThisStore}
        />

        {(error || checkoutError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
            {error || checkoutError}
          </div>
        )}

        <div className="mb-4 flex gap-2">


        </div>

        {(() => {
          console.log('Rendering alert check: limitExceeded =', limitExceeded);
          return limitExceeded;
        })() && (
          <div className="relative rounded-lg border-4 border-red-500 bg-red-100 px-6 py-4 text-lg font-bold text-red-900 dark:border-red-400 dark:bg-red-900 dark:text-red-100 shadow-lg animate-pulse">
            ⚠️ ALERT: Store owner has exceeded their subscription limits!<br />
            Plan: {subscription.plan}, Status: {subscription.status}<br />
            Counts - Products: {counts.products}, Services: {counts.services}, Promos: {counts.promos}, Categories: {counts.categories}, Payments: {counts.payments}<br />
            Customers cannot place orders at this time. Please contact the store owner to upgrade their plan.
          </div>
        )}

        <Button
          type="button"
          className="sticky bottom-0 h-12 w-full gap-2 text-base rounded-xl bg-white border border-gray-300 text-black font-bold hover:bg-gray-50 hover:scale-96 active:scale-95 transition-all duration-50 active:bg-gray-100"
          disabled={!canSubmit || isSubmitting}
          onPointerDown={handleCheckout}
        >
          <MessageCircle className="size-5" />
          {isSubmitting ? "Placing Order..." : "Order on WhatsApp"}
        </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
});

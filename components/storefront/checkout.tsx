"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";

import { BRAND_NAME } from "@/lib/brand";
import { useCart, type CartLine } from "@/hooks/useCart";
import { formatMoney } from "@/lib/format";
import { placeOrder, type CustomerDetails } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";



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
    "📦 *ORDER RECEIVED*",
    `🏪 *Store:* ${storeName}`,
    "",
    "👤 *Customer:*",
    `  • Name: ${customer.name.trim()}`,
    `  • Address: ${customer.address.trim() || "Not provided"}`,
    customer.notes.trim() ? `  • Notes: ${customer.notes.trim()}` : "",
    "",
    "🛒 *Items Ordered:*",
  ];

  cartItems.forEach((item, index) => {
    const lineTotal = item.price_cents * item.quantity;
    lines.push(
      `  ${index + 1}. ${item.name} x${item.quantity} - ${formatMoney(lineTotal, item.currency)}`,
    );
  });

  lines.push("", `💵 *Total:* ${formatMoney(totalCents, currency)}`, "");
  lines.push(`🚀 *Powered by ${BRAND_NAME}*`);

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
  window.location.href = `https://wa.me/${phone}?text=${encoded}`;
}

type CheckoutProps = {
  storeId: string;
  storeName: string;
  whatsappNumber: string;
  className?: string;
};

export function Checkout({
  storeId,
  storeName,
  whatsappNumber,
  className,
}: CheckoutProps) {
  const { items, storeId: cartStoreId, setQuantity, removeItem } = useCart();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartForThisStore = useMemo(() => {
    if (cartStoreId !== storeId) return [];
    return items;
  }, [cartStoreId, storeId, items]);

  const totalForDisplay = useMemo(
    () =>
      cartForThisStore.reduce(
        (sum, line) => sum + line.price_cents * line.quantity,
        0,
      ),
    [cartForThisStore],
  );

  const currencyForDisplay = cartForThisStore[0]?.currency ?? "USD";

  const canSubmit =
    cartForThisStore.length > 0 &&
    name.trim().length > 0 &&
    address.trim().length > 0 &&
    digitsOnly(whatsappNumber).length >= 8;

  const handleCheckout = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    const customer: CustomerDetails = {
      name: name.trim(),
      address: address.trim(),
      notes: notes.trim(),
    };
    const whatsappMessage = formatWhatsAppOrderMessage(
      storeName,
      cartForThisStore,
      customer,
      totalForDisplay,
      currencyForDisplay,
    );
    try {
      await placeOrder(
        storeId,
        cartForThisStore,
        customer,
        totalForDisplay,
        currencyForDisplay,
        whatsappMessage,
      );
      // Success, proceed to WhatsApp
      generateWhatsAppLink(
        whatsappNumber,
        cartForThisStore,
        customer,
        storeName,
        totalForDisplay,
        currencyForDisplay,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      id="store-checkout"
      className={cn(
        "scroll-mt-24 border-0 bg-white/95 shadow-xl shadow-black/[0.07] ring-1 ring-black/[0.06] dark:bg-zinc-900/95 dark:shadow-black/40 dark:ring-white/[0.08]",
        className,
      )}
    >
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
          Checkout
        </CardTitle>
        <CardDescription className="text-[0.8125rem] leading-relaxed">
          Add your details and continue to WhatsApp to confirm with the seller.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cartStoreId !== null && cartStoreId !== storeId && items.length > 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            Your cart is for another store. Add items here to start a new order.
          </p>
        ) : null}

        <section className="space-y-3" aria-labelledby="cart-heading">
          <h3 id="cart-heading" className="text-sm font-semibold">
            Cart
          </h3>
          {cartForThisStore.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="space-y-3">
              {cartForThisStore.map((line) => (
                <li
                  key={line.productId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatMoney(line.price_cents, line.currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label={`Decrease ${line.name}`}
                      onClick={() =>
                        setQuantity(line.productId, line.quantity - 1)
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="min-w-[2ch] text-center text-sm tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label={`Increase ${line.name}`}
                      onClick={() =>
                        setQuantity(line.productId, line.quantity + 1)
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${line.name}`}
                      onClick={() => removeItem(line.productId)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex items-center justify-between border-t pt-4 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">
            {formatMoney(
              cartForThisStore.length ? totalForDisplay : 0,
              currencyForDisplay,
            )}
          </span>
        </div>

        <section className="space-y-4" aria-labelledby="details-heading">
          <h3 id="details-heading" className="text-sm font-semibold">
            Your details
          </h3>
          <div className="space-y-2">
            <Label htmlFor="customer-name">Full name</Label>
            <Input
              id="customer-name"
              name="name"
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-address">Address</Label>
            <Textarea
              id="customer-address"
              name="address"
              autoComplete="street-address"
              placeholder="Street, city, postal code…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-notes">Notes (optional)</Label>
            <Textarea
              id="customer-notes"
              name="notes"
              placeholder="Allergies, delivery time, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="h-11 w-full gap-2 text-base sm:h-12"
          disabled={!canSubmit || isSubmitting}
          onClick={handleCheckout}
        >
          <MessageCircle className="size-5" aria-hidden />
          {isSubmitting ? "Placing Order..." : "Order on WhatsApp"}
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  storeId: string;
};

export function FloatingCart({ storeId }: Props) {
  const { storeId: cartStoreId, itemCount } = useCart();
  const count = cartStoreId === storeId ? itemCount : 0;

  function goToCheckout() {
    document
      .getElementById("store-checkout")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={cn(
        "fixed z-50 lg:hidden",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
        "right-[max(1.25rem,env(safe-area-inset-right,0px))]",
      )}
    >
      <Button
        type="button"
        size="icon"
        onClick={goToCheckout}
        className="relative h-14 w-14 rounded-full shadow-lg shadow-black/20 ring-2 ring-background dark:shadow-black/40"
        aria-label={
          count > 0
            ? `Cart, ${count} items. Go to checkout`
            : "Go to checkout"
        }
      >
        <ShoppingBag className="size-6" aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-foreground ring-2 ring-background">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Button>
    </div>
  );
}

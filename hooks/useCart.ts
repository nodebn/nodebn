import { useMemo } from "react";

import { useCartStore, type CartLine } from "@/stores/cart-store";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const storeId = useCartStore((s) => s.storeId);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalCents = useMemo(
    () =>
      items.reduce(
        (sum, line) => sum + line.price_cents * line.quantity,
        0,
      ),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );

  const currency = items[0]?.currency ?? "USD";

  return {
    items,
    storeId,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    totalCents,
    currency,
    itemCount,
  };
}

export type { CartLine };

import { create } from "zustand";

export type CartLine = {
  productId: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  quantity: number;
  imageUrl?: string | null;
};

type AddLineInput = Omit<CartLine, "quantity"> & { quantity?: number };

type CartState = {
  storeId: string | null;
  items: CartLine[];
  addItem: (storeId: string, line: AddLineInput) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  storeId: null,
  items: [],

  addItem: (storeId, line) => {
    const qty = line.quantity ?? 1;
    set((state) => {
      if (state.storeId !== null && state.storeId !== storeId) {
        return {
          storeId,
          items: [{ ...line, quantity: qty }],
        };
      }

      const baseItems =
        state.storeId === null || state.storeId === storeId ? state.items : [];

      const idx = baseItems.findIndex((i) => i.productId === line.productId);
      if (idx === -1) {
        return {
          storeId,
          items: [...baseItems, { ...line, quantity: qty }],
        };
      }

      const next = [...baseItems];
      next[idx] = {
        ...next[idx],
        quantity: next[idx].quantity + qty,
        price_cents: line.price_cents,
        currency: line.currency,
        name: line.name,
        slug: line.slug,
        imageUrl: line.imageUrl ?? next[idx].imageUrl,
      };
      return { storeId, items: next };
    });
  },

  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((i) => i.productId !== productId);
      return {
        items,
        storeId: items.length === 0 ? null : state.storeId,
      };
    }),

  setQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const items = state.items.filter((i) => i.productId !== productId);
        return {
          items,
          storeId: items.length === 0 ? null : state.storeId,
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      };
    }),

  clearCart: () => set({ storeId: null, items: [] }),
}));

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Check, ChevronRight } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatMoney } from "@/lib/format";
import { slugify } from "@/lib/slugify";



import { cn } from "@/lib/utils";

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  stock_quantity: number | null;
  categories: { name: string } | null;
  sort_order: number | null;
  created_at: string;
  product_images: { url: string; alt_text: string | null; sort_order: number }[];
  product_variants: { id: string; name: string; price_cents: number; stock_quantity: number | null; is_active: boolean }[];
};

type ProductGridProps = {
  storeId: string;
  products: StorefrontProduct[];
  storeSlug: string;
  categories?: { id: string; name: string; sort_order: number }[];
  isCategoryPage?: boolean;
};

function primaryImage(product: StorefrontProduct) {
  const sorted = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return sorted[0]?.url ?? null;
}

export function ProductGrid({
  storeId,
  products,
  storeSlug,
  categories: propCategories,
  isCategoryPage = false,
}: ProductGridProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [showAddedDialog, setShowAddedDialog] = useState(false);

  // Helper function to check if a product has any stock (including variants)
  const hasStock = (product: StorefrontProduct) => {
    // If product has variants, check if any variant has stock
    if (product.product_variants.length > 0) {
      return product.product_variants.some(variant =>
        variant.is_active && (variant.stock_quantity === null || variant.stock_quantity > 0)
      );
    }
    // Otherwise check main product stock
    return product.stock_quantity === null || product.stock_quantity > 0;
  };

  // Helper function to get display price (handles variants)
  const getDisplayPrice = (product: StorefrontProduct) => {
    if (product.product_variants.length > 0) {
      const activeVariants = product.product_variants.filter(v => v.is_active);
      if (activeVariants.length === 0) return formatMoney(product.price_cents, product.currency);

      const lowestPrice = Math.min(...activeVariants.map(v => v.price_cents));
      return `From ${formatMoney(lowestPrice, product.currency)}`;
    }
    return formatMoney(product.price_cents, product.currency);
  };

  const groupedProducts = useMemo(() => {
    const groups: Record<string, StorefrontProduct[]> = {};
    for (const product of products) {
      const catName = product.categories?.name || "Uncategorized";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(product);
    }
    // Sort products within each group: custom order (1,2,...) first asc, then auto (0) by created_at desc
    for (const cat in groups) {
      groups[cat].sort((a, b) => {
        const aIsAuto = a.sort_order === 0;
        const bIsAuto = b.sort_order === 0;
        if (aIsAuto && bIsAuto) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newer first for auto
        if (aIsAuto) return 1;
        if (bIsAuto) return -1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    }
    return groups;
  }, [products]);

  const categoryNames = useMemo(() => {
    const sortOrderMap = propCategories?.reduce((map, cat) => {
      map[cat.name] = cat.sort_order;
      return map;
    }, {} as Record<string, number>) || {};
    return Object.keys(groupedProducts).sort((a, b) => {
      const aOrder = sortOrderMap[a] ?? 0;
      const bOrder = sortOrderMap[b] ?? 0;
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return aOrder - bOrder || a.localeCompare(b);
    });
  }, [groupedProducts, propCategories]);

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-black/10 bg-white/60 px-6 py-16 text-center dark:border-white/10 dark:bg-zinc-900/40">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <Package className="size-7 text-muted-foreground/60" aria-hidden />
        </div>
        <p className="text-sm font-medium text-foreground/80">Coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No products yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {propCategories && propCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {propCategories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const element = document.getElementById(`category-${slugify(cat.name)}`);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="whitespace-nowrap px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      {/* Show categorized products first */}
      {categoryNames.filter(catName => catName !== "Uncategorized").map((catName) => {
        const prods = groupedProducts[catName];
        const displayedProds = isCategoryPage ? prods : prods.slice(0, 4);
        const hasMore = prods.length > 4;
        return (
          <Card key={catName} id={`category-${slugify(catName)}`} className="bg-white border-gray-200 rounded-2xl p-6 space-y-4 group">
            <h3 className="font-bold text-lg text-foreground">{catName}</h3>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayedProds.map((product) => {
          const src = primaryImage(product);
          return (
            <li key={product.id} className="min-w-0">
              <Card
                className={cn(
                  "h-full min-h-[400px] overflow-hidden border-0 bg-white/90 shadow-md shadow-black/[0.06] ring-1 ring-black/[0.06] transition-shadow duration-300 dark:bg-zinc-900/80 dark:shadow-black/30 dark:ring-white/[0.08] cursor-pointer flex flex-col active:scale-[0.98] transition-transform",
                  "hover:shadow-lg hover:shadow-black/[0.08] dark:hover:shadow-black/40",
                  // Better mobile touch feedback
                  "sm:hover:scale-100 active:scale-[0.98]",
                )}
                style={{ contain: 'layout' }}
                onClick={() => router.push(`/${storeSlug}/${product.slug}`)}
              >
                 <CardHeader className="p-0">
                   <AspectRatio ratio={1}>
                     <div
                       className={cn(
                         "relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
                         src && "from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800",
                       )}
                       style={{ aspectRatio: '1 / 1' }}
                     >
                       {src ? (
                         <>
                           <img
                             src={src}
                             alt={product.name}
                             className="absolute inset-0 w-full h-full object-cover"
                             style={{ objectFit: 'cover' }}
                           />
                           <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                         </>
                       ) : (
                         <Package
                           className="size-10 text-muted-foreground/45"
                           aria-hidden
                         />
                       )}
                     </div>
                   </AspectRatio>
                  <div className="space-y-1.5 px-3 pt-3 sm:px-4 sm:pt-4">
                    {product.categories?.name ? (
                      <Badge
                        variant="secondary"
                        className="w-fit max-w-full truncate border-0 bg-zinc-100/90 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        {product.categories.name}
                      </Badge>
                    ) : null}
                    <CardTitle className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug sm:text-base">
                      {product.name}
                    </CardTitle>
                    {product.description ? (
                      <CardDescription className="line-clamp-2 text-xs leading-relaxed sm:text-sm">
                        {product.description}
                      </CardDescription>
                    ) : null}
                  </div>
                </CardHeader>
                 <CardContent className="flex flex-col gap-2 px-3 pb-4 pt-0 sm:px-4 sm:pb-5 flex-1">
                   <div className="flex-1">
                        <p className="text-[0.9375rem] font-semibold tabular-nums tracking-tight text-foreground sm:text-base">
                          {getDisplayPrice(product)}
                        </p>
                   </div>
                      <Button
                      type="button"
                      size="sm"
                      className="flex items-center justify-between gap-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm mt-auto px-4 py-2 truncate"
                      disabled={!hasStock(product)}
                      onClick={(e) => {
                        e.stopPropagation();

                        // If product has variants, redirect to product page for selection
                        if (product.product_variants.length > 0) {
                          router.push(`/${storeSlug}/${product.slug}`);
                          return;
                        }

                        // For simple products, check stock and add to cart
                        if (!hasStock(product)) {
                          alert('This item is out of stock');
                          return;
                        }

                        addItem(storeId, {
                          productId: product.id,
                          name: product.name,
                          slug: product.slug,
                          price_cents: product.price_cents,
                          currency: product.currency,
                          imageUrl: src,
                          variant_id: null,
                          variant_name: null,
                        });
                        setShowAddedDialog(true);
                        setTimeout(() => setShowAddedDialog(false), 2000);
                      }}
                    >
                      {product.product_variants.length > 0 ? 'Select' : 'Add'}
                      <ShoppingBag className="size-4 ml-1 sm:ml-2 flex-shrink-0" aria-hidden />
                    </Button>
                  <span className="sr-only">
                    Product {product.slug} in store {storeSlug}
                  </span>
                </CardContent>
                </Card>
              </li>
            );
              })}
            </ul>
            {!isCategoryPage && hasMore && (
              <div className="flex justify-center pt-3 border-t border-gray-100/50 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50/80 active:bg-gray-100/80 transition-all duration-200 gap-2 group rounded-lg"
                  asChild
                >
                  <Link
                    href={`/${storeSlug}/categories/${encodeURIComponent(catName)}`}
                    className="flex items-center gap-2"
                    aria-label={`View all ${prods.length} products in ${catName} category`}
                    prefetch={false} // Avoid prefetching category pages to save bandwidth
                  >
                    <span>View all {prods.length} products</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-active:scale-95" />
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        );
      })}



      <Dialog open={showAddedDialog} onOpenChange={setShowAddedDialog}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Added to Cart
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

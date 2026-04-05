"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Package, ShoppingBag } from "lucide-react";

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
import { formatMoney } from "@/lib/format";
import { pressableClass } from "@/components/storefront/touch-feedback";
import { cn } from "@/lib/utils";

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  categories: { name: string } | null;
  product_images: { url: string; alt_text: string | null; sort_order: number }[];
};

type ProductGridProps = {
  storeId: string;
  products: StorefrontProduct[];
  storeSlug: string;
  categories?: string[];
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
}: ProductGridProps) {
  const { addItem } = useCart();
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    if (propCategories) {
      return propCategories;
    }
    const names = new Set<string>();
    for (const p of products) {
      const n = p.categories?.name?.trim();
      if (n) names.add(n);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [products, propCategories]);

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((p) => p.categories?.name === category);
  }, [products, category]);

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
    <div className="space-y-4">
      {categories.length > 0 ? (
        <div className="-mx-1 pb-1 pt-0.5">
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Categories
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1 pl-1 pr-4 scrollbar-hide"
            role="tablist"
            aria-label="Filter by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={category === "all"}
              onClick={() => setCategory("all")}
              className={pressableClass(
                cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-[box-shadow,background-color,color]",
                  category === "all"
                    ? "bg-foreground text-background shadow-md shadow-black/10 ring-transparent dark:shadow-black/30"
                    : "bg-white/90 text-foreground ring-black/[0.08] hover:bg-white dark:bg-zinc-900/90 dark:ring-white/10 dark:hover:bg-zinc-900",
                ),
              )}
            >
              All
              <span className="ml-1.5 tabular-nums text-xs opacity-70">
                {products.length}
              </span>
            </button>
            {categories.map((name) => {
              const n = products.filter((p) => p.categories?.name === name)
                .length;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={category === name}
                  onClick={() => setCategory(name)}
                  className={pressableClass(
                    cn(
                      "max-w-[220px] shrink-0 truncate rounded-full px-4 py-2 text-sm font-medium ring-1 transition-[box-shadow,background-color,color]",
                      category === name
                        ? "bg-foreground text-background shadow-md shadow-black/10 ring-transparent dark:shadow-black/30"
                        : "bg-white/90 text-foreground ring-black/[0.08] hover:bg-white dark:bg-zinc-900/90 dark:ring-white/10 dark:hover:bg-zinc-900",
                    ),
                  )}
                >
                  {name}
                  <span className="ml-1.5 tabular-nums text-xs opacity-70">
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => {
          const src = primaryImage(product);
          return (
            <li key={product.id} className="min-w-0">
              <Card
                className={cn(
                  "h-full overflow-hidden border-0 bg-white/90 shadow-md shadow-black/[0.06] ring-1 ring-black/[0.06] transition-shadow duration-300 dark:bg-zinc-900/80 dark:shadow-black/30 dark:ring-white/[0.08]",
                  "hover:shadow-lg hover:shadow-black/[0.08] dark:hover:shadow-black/40",
                )}
              >
                <CardHeader className="p-0">
                  <AspectRatio ratio={1}>
                    <div
                      className={cn(
                        "relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
                        src && "from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800",
                      )}
                    >
                      {src ? (
                        <>
                          <Image
                            src={src}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized
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
                <CardContent className="flex flex-col gap-2.5 px-3 pb-4 pt-0 sm:px-4 sm:pb-5">
                  <p className="text-[0.9375rem] font-semibold tabular-nums tracking-tight text-foreground sm:text-base">
                    {formatMoney(product.price_cents, product.currency)}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 w-full gap-2 rounded-xl text-sm font-semibold shadow-sm"
                    onClick={() =>
                      addItem(storeId, {
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price_cents: product.price_cents,
                        currency: product.currency,
                        imageUrl: src,
                      })
                    }
                  >
                    <ShoppingBag className="size-4" aria-hidden />
                    Add
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

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-zinc-900/40">
          No products in this category.
        </p>
      ) : null}
    </div>
  );
}

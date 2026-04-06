"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";

import { formatMoney } from "@/lib/format";
import { slugify } from "@/lib/slugify";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  categories: { name: string } | null;
  sort_order: number | null;
  created_at: string;
  product_images: { url: string; alt_text: string | null; sort_order: number }[];
  product_variants: { id: string; name: string; price_cents: number; is_active: boolean }[];
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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

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
        return (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name);
      });
    }
    return groups;
  }, [products]);

  const categoryNames = useMemo(() => {
    return Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));
  }, [groupedProducts]);

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
      {categoryNames.filter(catName => catName !== "Uncategorized").map((catName) => {
        const prods = groupedProducts[catName];
        const displayedProds = isCategoryPage ? prods : prods.slice(0, 4);
        const hasMore = prods.length > 4;
        return (
          <Card key={catName} id={`category-${slugify(catName)}`} className="bg-white border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-foreground">{catName}</h3>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayedProds.map((product) => {
          const src = primaryImage(product);
          return (
            <li key={product.id} className="min-w-0">
              <Card
                className={cn(
                  "h-full min-h-[400px] overflow-hidden border-0 bg-white/90 shadow-md shadow-black/[0.06] ring-1 ring-black/[0.06] transition-shadow duration-300 dark:bg-zinc-900/80 dark:shadow-black/30 dark:ring-white/[0.08] cursor-pointer flex flex-col",
                  "hover:shadow-lg hover:shadow-black/[0.08] dark:hover:shadow-black/40",
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
                    >
                      {src ? (
                        <>
                          <Image
                            src={src}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                     {product.product_variants.length > 1 ? (
                       (() => {
                         const lowestVariant = product.product_variants.reduce((min, v) => v.price_cents < min.price_cents ? v : min);
                         const selectedId = selectedVariants[product.id] || lowestVariant.id;
                         return (
                           <>
                             <Select
                               value={selectedId}
                               onValueChange={(value) => setSelectedVariants(prev => ({ ...prev, [product.id]: value }))}
                             >
                               <SelectTrigger className="w-full h-8 text-xs rounded-none bg-white text-black font-mono border border-black focus:ring-0 focus:ring-offset-0">
                                 <SelectValue />
                                 <span className="ml-auto text-black">[v]</span>
                               </SelectTrigger>
                               <SelectContent className="rounded-none bg-white text-black font-mono border border-black">
                                 {product.product_variants.map(v => (
                                   <SelectItem key={v.id} value={v.id} className="focus:bg-gray-200">
                                     {v.name} - {formatMoney(v.price_cents, product.currency)}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <p className="text-[0.9375rem] font-semibold tabular-nums tracking-tight text-foreground sm:text-base">
                               {formatMoney(product.product_variants.find(v => v.id === selectedId)?.price_cents || lowestVariant.price_cents, product.currency)}
                             </p>
                           </>
                         );
                       })()
                     ) : (
                       <p className="text-[0.9375rem] font-semibold tabular-nums tracking-tight text-foreground sm:text-base">
                         {formatMoney(product.price_cents, product.currency)}
                       </p>
                     )}
                   </div>
                   <Button
                     type="button"
                     size="sm"
                     className="h-10 w-full gap-2 rounded-xl text-sm font-semibold shadow-sm mt-auto"
                     onClick={(e) => {
                       e.stopPropagation();
                       if (product.product_variants.length > 0) {
                         const lowestVariant = product.product_variants.reduce((min, v) => v.price_cents < min.price_cents ? v : min);
                         const selectedId = selectedVariants[product.id] || lowestVariant.id;
                         const variant = product.product_variants.find(v => v.id === selectedId);
                         addItem(storeId, {
                           productId: product.id,
                           name: product.name,
                           slug: product.slug,
                           price_cents: variant?.price_cents || product.price_cents,
                           currency: product.currency,
                           imageUrl: src,
                           variant_id: variant?.id || null,
                           variant_name: variant?.name || null,
                         });
                       } else {
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
                       }
                     }}
                   >
                     Add to Cart
                     <ShoppingBag className="size-4" aria-hidden />
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
              <div className="flex justify-center">
                <Button variant="outline" className="rounded-none" asChild>
                  <Link href={`/${storeSlug}/categories/${encodeURIComponent(catName)}`}>
                    View all
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

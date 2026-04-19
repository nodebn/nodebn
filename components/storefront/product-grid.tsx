"use client";

import { useMemo, useState } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Check, ChevronRight, Search } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  is_active: boolean;
  category_id: string | null;
  categories?: { name: string } | null;
  sort_order: number | null;
  created_at: string;
  badge_text: string | null;
  badge_style: string;
  product_images: { url: string; sort_order: number }[];
  product_variants: {
    id: string;
    name: string;
    price_cents: number;
    stock_quantity: number | null;
    is_active: boolean;
  }[];
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
  const { items, addItem } = useCart();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Search filter (name priority)
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [products, searchQuery]);
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
    console.log('[storefront] Grouping products:', {
      totalProducts: products.length,
      sampleProduct: products[0] ? {
        id: products[0].id,
        name: products[0].name,
        category: products[0].categories?.name || 'none'
      } : null
    });

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
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 rounded-lg"
            />
          </div>
        </div>

      </div>

      {/* Categories or Search Results */}
      {searchQuery.trim() ? (
        // Search mode: flat grid
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results ({filteredAndSortedProducts.length} found)</h2>
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedProducts.map((product) => {
                const src = primaryImage(product);
                return (
                  <div key={product.id} className="min-w-0">
                    <Card
                      className={cn(
                        "h-full min-h-[400px] overflow-hidden border-0 bg-white/90 shadow-md shadow-black/[0.06] ring-1 ring-black/[0.06] transition-shadow duration-300 dark:bg-zinc-900/80 dark:shadow-black/30 dark:ring-white/[0.08] cursor-pointer flex flex-col active:scale-[0.98] transition-transform",
                        "hover:shadow-lg hover:shadow-black/[0.08] dark:hover:shadow-black/40",
                      )}
                      onClick={() => router.push(`/${storeSlug}/${product.slug}`)}
                    >
                      <div className="relative">
                        <div
                          className="w-full aspect-square relative bg-muted rounded-t-lg overflow-hidden"
                          style={{ aspectRatio: '1 / 1' }}
                        >
                        {src ? (
                          <>
                            <Image
                              src={src}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                          </>
                        ) : (
                          <Package
                            className="size-10 text-muted-foreground/45"
                            aria-hidden
                          />
                        )}
                        {product.badge_text && (
                          <div
                            className={`absolute top-2 left-2 px-2.5 py-1 rounded-xl text-xs font-bold uppercase border font-mono tracking-[0.05em] ${
                              product.badge_style === 'warning'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : product.badge_style === 'positive'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {product.badge_text}
                          </div>
                        )}
                        </div>
                      </div>
                      <CardContent className="flex-1 flex flex-col p-4">
                         <h3 className="font-semibold text-sm leading-tight line-clamp-3 mb-2 text-foreground">
                           {product.name}
                         </h3>
                         <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                           {product.description}
                         </p>
                         <div className="mb-3">
                           <span className="font-bold text-sm tabular-nums">
                             {getDisplayPrice(product)}
                           </span>
                         </div>
                         <div className="flex justify-center mt-auto">
                             <Button
                               size="sm"
                               className="h-8 px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-md transition-colors"
                               disabled={!hasStock(product)}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (!hasStock(product)) {
                                   alert('This item is out of stock');
                                   return;
                                 }

                                 if (product.product_variants.length > 0) {
                                   // For products with variants, go to detail page
                                   router.push(`/${storeSlug}/${product.slug}`);
                                   return;
                                 }

                                 // For simple products, check stock considering cart and add to cart
                                 const currentQty = items.find(i => i.productId === product.id && !i.variant_id)?.quantity || 0;
                                 const availableStock = product.stock_quantity;
                                 console.log('[storefront] Stock check: product', product.id, 'currentQty', currentQty, 'availableStock', availableStock, 'condition', availableStock !== null && currentQty + 1 > availableStock);
                                 if (availableStock !== null && currentQty + 1 > availableStock) {

                                   console.log('Triggering not enough stock alert');
                                   alert('Not enough stock for this item');
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
                                   quantity: 1,
                                 });
                                 setShowAddedDialog(true);
                                 setTimeout(() => setShowAddedDialog(false), 2000);
                               }}
                             >
                             {product.product_variants.length > 0 ? 'Select Options' : (hasStock(product) ? 'Add' : 'Out of Stock')}
                             <ShoppingBag className="size-3 flex-shrink-0" aria-hidden />
                           </Button>
                         </div>
                      </CardContent>
                     </Card>
                   </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Normal mode: categories
        <>
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
                              <Image
                                src={src}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                          </>
                        ) : (
                          <Package
                            className="size-10 text-muted-foreground/45"
                            aria-hidden
                          />
                        )}
                        {product.badge_text && (
                          <div
                            className={`absolute top-2 left-2 px-2.5 py-1 rounded-xl text-xs font-bold uppercase border font-mono tracking-[0.05em] ${
                              product.badge_style === 'warning'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : product.badge_style === 'positive'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {product.badge_text}
                          </div>
                        )}
                      </div>
                    </AspectRatio>
                  </CardHeader>
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

                        // For simple products, check stock considering cart and add to cart
                              const currentQty = items.find(i => i.productId === product.id && !i.variant_id)?.quantity || 0;
                              const availableStock = product.stock_quantity;
                              console.log('[storefront] Stock check: product', product.id, 'currentQty', currentQty, 'availableStock', availableStock, 'condition', availableStock !== null && currentQty + 1 > availableStock);
                              if (availableStock !== null && currentQty + 1 > availableStock) {
                                console.log('Triggering not enough stock alert');
                                alert('Not enough stock for this item');
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
                          quantity: 1,
                        });
                        setShowAddedDialog(true);
                        setTimeout(() => setShowAddedDialog(false), 2000);
                      }}
                    >
                      {product.product_variants.length > 0 ? 'Select Options' : (hasStock(product) ? 'Add' : 'Out of Stock')}
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
        </>
      )}

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

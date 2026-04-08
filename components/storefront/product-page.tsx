"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";

import { ShoppingBag, Minus, Plus, X, Check, ChevronLeft, ChevronRight } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp_number: string | null;
};

type ProductImage = {
  id: string;
  url: string;
  sort_order: number;
};

type ProductVariant = {
  id: string;
  name: string;
  price_cents: number;
  stock_quantity: number | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  stock_quantity: number | null;
  badge_text: string | null;
  badge_style: string;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

type Props = {
  store: Store;
  product: Product;
};

export function ProductPageClient({ store, product }: Props) {
  const router = useRouter();
  const { items, addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);


  const sortedVariants = product.product_variants.sort((a, b) => a.name.localeCompare(b.name));

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    (sortedVariants && sortedVariants.length > 0) ? sortedVariants[0].id : ""
  );

  const [showAddedDialog, setShowAddedDialog] = useState(false);

  const selectedVariant = sortedVariants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant ? selectedVariant.price_cents : product.price_cents;

  // Get images, handling variant images if needed
  const images = product.product_images || [];

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariantId]);

  const goToPreviousImage = () => {
    setSelectedImage(prev => Math.max(0, prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImage(prev => Math.min(images.length - 1, prev + 1));
  };



  const handleAddToCart = () => {
    // Check stock before adding, considering current cart
    const selectedVariantStock = selectedVariant?.stock_quantity;
    const productStock = product.stock_quantity;
    const stockToCheck = (selectedVariant && selectedVariantStock !== null && selectedVariantStock !== undefined)
      ? selectedVariantStock
      : productStock;

    const currentQty = items.find(i =>
      i.productId === product.id &&
      i.variant_id === (selectedVariant?.id || null)
    )?.quantity || 0;

    if (stockToCheck !== null && stockToCheck !== undefined && (stockToCheck === 0 || currentQty + 1 > stockToCheck)) {
      alert('Not enough stock for this item');
      return;
    }

    addItem(store.id, {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price_cents: displayPrice,
      currency: product.currency,
      quantity: 1,
      imageUrl: images[0]?.url || null,
      variant_id: selectedVariant?.id || null,
      variant_name: selectedVariant?.name || null,
    });
    setShowAddedDialog(true);
    setTimeout(() => {
      setShowAddedDialog(false);
      router.push(`/${store.slug}`);
    }, 1500);
  };

  // Check if item is out of stock
  const isOutOfStock = (() => {
    const selectedVariantStock = selectedVariant?.stock_quantity;
    const productStock = product.stock_quantity;
    const stockToCheck = (selectedVariant && selectedVariantStock !== null && selectedVariantStock !== undefined)
      ? selectedVariantStock
      : productStock;

    return stockToCheck === 0 || (stockToCheck !== null && stockToCheck !== undefined && stockToCheck < 1);
  })();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 relative">
      <button
        className="absolute top-[max(1rem,env(safe-area-inset-top,1rem))] right-[max(1rem,env(safe-area-inset-right,1rem))] z-10 bg-transparent border-none text-muted-foreground cursor-pointer p-2 rounded"
        onClick={() => router.push(`/${store.slug}`)}
        aria-label="Close product page"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image display */}
        <div className="space-y-4">
          <div className="relative">
            <div className="w-full max-w-xs mx-auto aspect-square relative bg-muted rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: '1 / 1' }}>
              {images[selectedImage] ? (
                  <>
                    <Image
                      src={images[selectedImage].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
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
                  </>
                ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Arrow Navigation */}
            {images.length > 1 && (
              <>
                {/* Previous Arrow */}
                <button
                  onClick={goToPreviousImage}
                  disabled={selectedImage === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>

                {/* Next Arrow */}
                <button
                  onClick={goToNextImage}
                  disabled={selectedImage === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Image Previews */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center max-w-xs mx-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-12 h-12 relative rounded border-2 transition-all duration-200 ${
                    i === selectedImage
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-muted hover:border-primary/50"
                  }`}
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <Image
                    src={img.url}
                    alt={`Product image ${i + 1}`}
                    fill
                    className="rounded object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <pre className="text-muted-foreground mt-2 font-mono text-sm overflow-y-auto max-h-32 p-2 bg-muted rounded whitespace-pre-wrap">
              {product.description || "[ NO_DESCRIPTION_DATA ]"}
            </pre>
          </div>

          <div className="text-3xl font-bold">
            {formatMoney(displayPrice, product.currency)}
          </div>

          {/* Variants */}
          {product.product_variants.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Options</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.product_variants.map((variant) => {
                  // Stock indicator for this variant
                  const getVariantStockIndicator = (variantStock: number | null) => {
                    if (variantStock === null || variantStock === undefined) return null;

                    const isLowStock = variantStock < 3 && variantStock > 0;
                    const isOutOfStock = variantStock === 0;
                    const isHighStock = variantStock >= 6;
                    const stockText = variantStock === 0
                      ? 'OUT OF STOCK'
                      : variantStock === 1
                      ? '1 LEFT'
                      : variantStock <= 5
                      ? 'FEW LEFT'
                      : 'IN STOCK';

                    return (
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-bold border
                        ${isOutOfStock
                          ? 'bg-gray-100 text-gray-800 border-gray-300'
                          : isLowStock
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : isHighStock
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                        }
                      `}>
                        <span className={`
                          inline-block w-1.5 h-1.5 rounded-full mr-1
                          ${isOutOfStock
                            ? 'bg-gray-500'
                            : isLowStock
                            ? 'bg-red-500'
                            : isHighStock
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          }
                        `}></span>
                        {stockText}
                      </span>
                    );
                  };

                  return (
                    <Button
                      key={variant.id}
                      type="button"
                      variant={selectedVariantId === variant.id ? "default" : "outline"}
                      disabled={variant.stock_quantity === 0 || (variant.stock_quantity !== null && variant.stock_quantity !== undefined && variant.stock_quantity < 1)}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                      }}
                      className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal disabled:opacity-50"
                    >
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium truncate">{variant.name}</span>
                          {getVariantStockIndicator(variant.stock_quantity)}
                        </div>
                        <span className="text-sm opacity-80">{formatMoney(variant.price_cents, product.currency)}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Display */}
          {(() => {
            // Check variant stock first, then fall back to product stock
            const variantStock = selectedVariant?.stock_quantity;
            const productStock = product.stock_quantity;

            // Use variant stock if variant is selected and has stock set, otherwise use product stock
            const stockToDisplay = (selectedVariant && variantStock !== null && variantStock !== undefined)
              ? variantStock
              : productStock;

            if (stockToDisplay !== null && stockToDisplay !== undefined) {
              const isLowStock = stockToDisplay < 3 && stockToDisplay > 0;
              const isHighStock = stockToDisplay >= 6;
              const stockText = stockToDisplay === 0
                ? 'OUT OF STOCK'
                : stockToDisplay === 1
                ? '1 LEFT'
                : stockToDisplay <= 5
                ? 'FEW LEFT'
                : 'IN STOCK';

              return (
                <div className={`
                  inline-flex items-center px-4 py-2 rounded-lg border-2 font-mono text-xs font-bold tracking-wider shadow-sm
                  ${isLowStock
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-300'
                    : isHighStock
                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-300'
                  }
                `}>
                  <span className={`
                    inline-block w-2 h-2 rounded-full mr-2
                    ${isLowStock
                      ? 'bg-red-500'
                      : isHighStock
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                    }
                  `}></span>
                  {stockText}
                </div>
              );
            }
            return null;
          })()}





          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full gap-2"
            disabled={isOutOfStock}
          >
            <ShoppingBag className="size-5" />
            {isOutOfStock ? 'Out of Stock' : 'Add'}
          </Button>
        </div>
      </div>

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
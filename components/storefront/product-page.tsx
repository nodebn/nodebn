"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ShoppingBag, Minus, Plus, X, Check } from "lucide-react";

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
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

type Props = {
  store: Store;
  product: Product;
};

export function ProductPageClient({ store, product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const sortedVariants = [...product.product_variants].sort((a, b) => a.id < b.id ? -1 : 1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    (sortedVariants && sortedVariants.length > 0) ? sortedVariants[0].id : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [showAddedDialog, setShowAddedDialog] = useState(false);

  const allImages = product.product_images.sort((a, b) => a.sort_order - b.sort_order);
  const images = allImages;
  const selectedVariant = sortedVariants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant ? selectedVariant.price_cents : product.price_cents;

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariantId]);

  const handleAddToCart = () => {
    addItem(store.id, {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price_cents: displayPrice,
      currency: product.currency,
      quantity,
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
        {/* Left: Thumbnail gallery */}
        <div className="space-y-4">
          <div className="w-full max-w-sm mx-auto aspect-square relative bg-muted rounded-lg overflow-hidden">
            {images[selectedImage] ? (
                <img
                  src={images[selectedImage].url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 relative rounded border-2 ${
                    i === selectedImage ? "border-primary" : "border-muted"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded"
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
                {product.product_variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={selectedVariantId === variant.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                    }}
                    className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium truncate w-full">{variant.name}</span>
                      <span className="text-sm opacity-80">{formatMoney(variant.price_cents, product.currency)}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-base font-medium">
              Quantity
            </Label>
            <div className="flex items-center gap-2 border rounded-md w-fit">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-0 focus:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full gap-2"
          >
            <ShoppingBag className="size-5" />
            Add to Cart
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
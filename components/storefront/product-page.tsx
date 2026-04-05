"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Minus, Plus } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
  console.log('ProductPageClient received product:', product);
  const { addItem } = useCart();
  const router = useRouter();
  const sortedVariants = [...product.product_variants].sort((a, b) => a.id < b.id ? -1 : 1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    (sortedVariants && sortedVariants.length > 0) ? sortedVariants[0].id : ""
  );
  const [quantity, setQuantity] = useState(1);

  const allImages = product.product_images.sort((a, b) => a.sort_order - b.sort_order);
  const images = allImages;
  console.log('product_variants:', product.product_variants, 'images:', images.map(img => ({ url: img.url.substring(0,50) })));
  const selectedVariant = sortedVariants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant ? selectedVariant.price_cents : product.price_cents;

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariantId]);

  const handleAddToCart = () => {
    console.log('Add to cart clicked');
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
    console.log('addItem called');
    router.push(`/${store.slug}`);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Thumbnail gallery */}
        <div className="space-y-4">
          <div className="w-full max-w-sm mx-auto aspect-square relative bg-muted rounded-lg overflow-hidden">
            {images[selectedImage] ? (
                <Image
                  src={images[selectedImage].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
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
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover rounded"
                    sizes="64px"
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
            <p className="text-muted-foreground mt-2">{product.description}</p>
          </div>

          <div className="text-3xl font-bold">
            {formatMoney(displayPrice, product.currency)}
          </div>

          {/* Variants */}
          {product.product_variants.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Options</Label>
              <div className="flex flex-wrap gap-2">
                {product.product_variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={selectedVariantId === variant.id ? "default" : "outline"}
                    onClick={() => {
                      console.log('Selected variant:', variant.id);
                      setSelectedVariantId(variant.id);
                    }}
                    className="flex-1 min-w-0"
                  >
                    {variant.name} - {formatMoney(variant.price_cents, product.currency)}
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
    </div>
  );
}
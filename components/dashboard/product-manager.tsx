"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, ImagePlus } from "lucide-react";

import { BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatMoney, parseDollarsToCents } from "@/lib/format";
import {
  PRODUCT_IMAGES_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/storage";
import { slugify } from "@/lib/slugify";
import type { DashboardProduct, ProductImageRow, ProductVariant, DashboardCategory } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  storeId: string;
  storeSlug: string;
  initialProducts: DashboardProduct[];
  categories: DashboardCategory[];
  subscription?: { plan: string; status: string };
};

function normalizeImages(raw: unknown): ProductImageRow[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.url !== "string") return null;
      return {
        id: r.id,
        url: r.url,
        sort_order: typeof r.sort_order === "number" ? r.sort_order : 0,
        variant_id: typeof r.variant_id === "string" ? r.variant_id : null,
      };
    })
    .filter(Boolean) as ProductImageRow[];
}

function normalizeVariants(raw: unknown): ProductVariant[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      if (typeof r.id !== "string" || typeof r.product_id !== "string" || typeof r.name !== "string") return null;
      return {
        id: r.id,
        product_id: r.product_id,
        name: r.name,
        price_cents: r.price_cents as number,
        is_active: Boolean(r.is_active),
      };
    })
    .filter(Boolean) as ProductVariant[];
}

function normalizeProduct(row: Record<string, unknown>): DashboardProduct {
  return {
    id: row.id as string,
    store_id: row.store_id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string | null) ?? null,
    price_cents: row.price_cents as number,
    currency: (row.currency as string) || "BND",
    is_active: Boolean(row.is_active),
    category_id: row.category_id as string | null,
    product_images: normalizeImages(row.product_images),
    product_variants: normalizeVariants(row.product_variants),
  };
}

async function uploadNewImages(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  storeId: string,
  storeSlug: string,
  productId: string,
  files: File[],
  startOrder: number,
) {
  const API_KEY = 'cb54039d79cc5273cc4f003c39b16394'; // ImgBB API key
  const uploadedImages: { url: string; sort_order: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64Data = base64.split(',')[1]; // Remove data:image/png;base64,

    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('image', base64Data);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error?.message || 'Upload failed');

    const { error: rowErr } = await supabase.from("product_images").insert({
      product_id: productId,
      url: result.data.url,
      sort_order: startOrder + i,
    });
    if (rowErr) throw rowErr;

    uploadedImages.push({
      url: result.data.url,
      sort_order: startOrder + i,
    });
  }

  return uploadedImages;
}

const ProductManager = memo(function ProductManager({ storeId, storeSlug, initialProducts, categories, subscription }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<DashboardProduct[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const getProductLimit = () => {
    const plan = subscription?.plan || 'free';
    switch (plan) {
      case 'free': return 10;
      case 'starter': return 20;
      case 'professional': return 100;
      case 'enterprise': return Infinity;
      default: return 10;
    }
  };

  const productLimit = getProductLimit();
  const canAddProduct = subscription ? products.length < productLimit : true;

  const editing = useMemo(
    () => (editingId ? products.find((p) => p.id === editingId) : null),
    [editingId, products],
  );

  function openCreate() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice("");
    setCategoryId("none");
    setIsActive(true);
    setFiles([]);
    setVariants([]);
    setVariantName("");
    setVariantPrice("");
    setEditingVariantId(null);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(p: DashboardProduct) {
    console.log('openEdit for product:', p.id, 'variants:', p.product_variants);
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description ?? "");
    setPrice((p.price_cents / 100).toFixed(2));
    setCategoryId(p.category_id ?? "none");
    setIsActive(p.is_active);
    setFiles([]);
    setVariants(p.product_variants);
    setVariantName("");
    setVariantPrice("");
    setEditingVariantId(null);
    setError(null);
    setDialogOpen(true);
  }

  function onNameInput(value: string) {
    if (!editingId) {
      const prev = slugify(name);
      setName(value);
      if (!slug || slug === prev) setSlug(slugify(value));
    } else {
      setName(value);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Delete this product and its images?")) return;
    const supabase = createBrowserSupabaseClient();
    const product = products.find((p) => p.id === id);
    const paths =
      product?.product_images
        .map((img) => storagePathFromPublicUrl(img.url))
        .filter(Boolean) as string[];

    if (paths.length) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
    }

    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (delErr) {
      alert(delErr.message);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    router.push("?tab=products");
    router.refresh();
  }

  async function removeImage(imageId: string, imageUrl: string) {
    if (!editingId) return;
    const supabase = createBrowserSupabaseClient();
    const path = storagePathFromPublicUrl(imageUrl);
    if (path) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    }
    const { error: delErr } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);
    if (delErr) {
      alert(delErr.message);
      return;
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              product_images: p.product_images.filter((i) => i.id !== imageId),
            }
          : p,
      ),
    );
  }

  function addVariant() {
    console.log('addVariant called with:', variantName, variantPrice);
    if (!variantName.trim() || !variantPrice.trim()) {
      console.log('Variant name or price empty');
      return;
    }
    const priceCents = parseDollarsToCents(variantPrice);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      console.log('Invalid price:', variantPrice);
      setError("Enter a valid variant price.");
      return;
    }
    console.log('Parsed price:', priceCents);
    if (editingVariantId) {
      setVariants((prev) =>
        prev.map((v) =>
          v.id === editingVariantId
            ? { ...v, name: variantName.trim(), price_cents: priceCents }
            : v
        )
      );
      setEditingVariantId(null);
    } else {
      const newVariant: ProductVariant = {
        id: `temp-${Date.now()}`,
        product_id: editingId || "temp",
        name: variantName.trim(),
        price_cents: priceCents,
        is_active: true,
      };
      setVariants((prev) => [...prev, newVariant]);
      console.log('Variant added to state:', newVariant);
    }
    setVariantName("");
    setVariantPrice("");
  }

  function editVariant(variant: ProductVariant) {
    setEditingVariantId(variant.id);
    setVariantName(variant.name);
    setVariantPrice((variant.price_cents / 100).toFixed(2));
  }

  function deleteVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id));
    if (editingVariantId === id) {
      setEditingVariantId(null);
      setVariantName("");
      setVariantPrice("");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    console.log('handleSave called, editingId:', editingId, 'variants:', variants);
    setError(null);
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
      setError("Product slug is required.");
      return;
    }
    const priceCents = parseDollarsToCents(price);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError("Enter a valid price.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data: user } = await supabase.auth.getUser();
    console.log('Current user:', user);

    try {
      console.log('Attempting save...');
      if (!editingId) {
        const { data: inserted, error: insErr } = await supabase
          .from("products")
          .insert({
            store_id: storeId,
            name: name.trim(),
            slug: normalizedSlug,
            description: description.trim() || null,
            price_cents: priceCents,
            currency: "BND",
            category_id: categoryId === "none" ? null : categoryId,
            is_active: isActive,
          })
          .select()
          .single();

        if (insErr) throw insErr;
        if (!inserted) throw new Error("No product returned");

        if (files.length) {
          await uploadNewImages(
            supabase,
            storeId,
            storeSlug,
            inserted.id as string,
            files,
            0,
          );
        }

        // Insert variants
        if (variants.length) {
          const variantInserts = variants.map((v) => ({
            product_id: inserted.id,
            name: v.name,
            price_cents: v.price_cents,
            is_active: v.is_active,
          }));
          console.log('Inserting variants for new product:', variantInserts);
          const { error: varInsErr } = await supabase
            .from("product_variants")
            .insert(variantInserts);
          if (varInsErr) {
            console.log('Variant insert error:', varInsErr);
            throw varInsErr;
          }
          console.log('Variants inserted successfully');
        }

        const { data: full, error: fetchErr } = await supabase
          .from("products")
          .select("*, product_images ( id, url, sort_order ), product_variants ( id, product_id, name, price_cents, is_active )")
          .eq("id", inserted.id)
          .single();

        if (fetchErr) throw fetchErr;
        const row = normalizeProduct(full as Record<string, unknown>);
        setProducts((prev) => [row, ...prev]);
      } else {
        const { error: upErr } = await supabase
          .from("products")
          .update({
            name: name.trim(),
            slug: normalizedSlug,
            description: description.trim() || null,
            price_cents: priceCents,
            category_id: categoryId === "none" ? null : categoryId,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("store_id", storeId);

        if (upErr) throw upErr;

        // Delete existing variants and insert new ones
        console.log('Deleting existing variants for product:', editingId);
        await supabase.from("product_variants").delete().eq("product_id", editingId);
        if (variants.length) {
          const variantInserts = variants.map((v) => ({
            product_id: editingId,
            name: v.name,
            price_cents: v.price_cents,
            is_active: v.is_active,
          }));
          console.log('Inserting variants for update:', variantInserts);
          const { error: varInsErr } = await supabase
            .from("product_variants")
            .insert(variantInserts);
          if (varInsErr) {
            console.log('Variant insert error:', varInsErr);
            throw varInsErr;
          }
          console.log('Variants inserted successfully');
        }

        if (editing && files.length) {
          const maxOrder = editing.product_images.length > 0 ? Math.max(...editing.product_images.map(img => img.sort_order)) + 1 : 0;
          await uploadNewImages(
            supabase,
            storeId,
            storeSlug,
            editingId,
            files,
            maxOrder,
          );
        }

        const { data: full, error: fetchErr } = await supabase
          .from("products")
          .select("*, product_images ( id, url, sort_order ), product_variants ( id, product_id, name, price_cents, is_active )")
          .eq("id", editingId)
          .single();

        if (fetchErr) throw fetchErr;
        const row = normalizeProduct(full as Record<string, unknown>);
        setProducts((prev) => prev.map((p) => (p.id === row.id ? row : p)));
      }

      setDialogOpen(false);
      router.push("?tab=products");
      window.location.reload();
    } catch (err: unknown) {
      console.log('Save error:', err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Create and manage products with variants and images for your {BRAND_NAME} store.
          </CardDescription>
          {subscription && (
            <p className="text-sm text-muted-foreground">
              {products.length}/{productLimit === Infinity ? '∞' : productLimit} products used
            </p>
          )}
          {subscription && !canAddProduct ? (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg dark:from-red-950 dark:to-pink-950 dark:border-red-800">
              <div className="text-red-600 dark:text-red-400">
                <span className="text-lg">🔒</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Product limit reached
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Upgrade to add more products
                </p>
              </div>
              <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 h-8 px-4 animate-pulse" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-upgrade'))}>
                <span>🔓</span>
                Unlock Now
              </Button>
            </div>
          ) : subscription && products.length >= productLimit * 0.8 && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg dark:from-amber-950 dark:to-orange-950 dark:border-amber-800">
              <div className="text-amber-600 dark:text-amber-400">
                <span className="text-lg">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Approaching product limit
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Unlock unlimited products with a plan upgrade
                </p>
              </div>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-8 px-4" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-upgrade'))}>
                <span>🚀</span>
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
        <Button type="button" size="sm" className="gap-1" disabled={!canAddProduct} onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Add product
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products yet. Add your first item to show it on your storefront.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {products.map((p) => {
              const thumb = [...p.product_images].sort(
                (a, b) => a.sort_order - b.sort_order,
              )[0];
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {thumb ? (
                      <Image
                        src={thumb.url}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{p.name}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatMoney(p.price_cents, p.currency)}
                      {!p.is_active ? (
                        <span className="ml-2 text-amber-600 dark:text-amber-400">
                          Hidden
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleDeleteProduct(p.id)}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg bg-background">
          <form onSubmit={(e) => void handleSave(e)}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit product" : "New product"}
              </DialogTitle>
              <DialogDescription>
                Set details and optionally upload images (JPEG, PNG, WebP).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  required
                  value={name}
                  onChange={(e) => onNameInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-desc">Description</Label>
                <Textarea
                  id="product-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[72px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Price (BND)</Label>
                <Input
                  id="product-price"
                  required
                  inputMode="decimal"
                  placeholder="12.99 BND"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This is the base price. Add variants below to offer multiple prices.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Variants</Label>
                {variants.length > 0 ? (
                  <ul className="space-y-2">
                    {variants.map((v) => {

                      return (
                      <li key={v.id} className="flex items-center gap-2 rounded border p-2">
                        <span className="flex-1">{v.name} - {formatMoney(v.price_cents, "BND")}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editVariant(v)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteVariant(v.id)}
                        >
                          Delete
                        </Button>
                      </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No variants added. All customers will pay the base price.</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="variant-name">Variant name</Label>
                    <Input
                      id="variant-name"
                      placeholder="e.g. Large"
                      value={variantName}
                      onChange={(e) => setVariantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="variant-price">Price (BND)</Label>
                    <Input
                      id="variant-price"
                      placeholder="12.99"
                      inputMode="decimal"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="button" onClick={addVariant} className="w-full">
                  {editingVariantId ? "Update" : "Add"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="product-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                />
                <Label htmlFor="product-active" className="font-normal">
                  Visible on storefront
                </Label>
              </div>

              {editingId && editing?.product_images.length ? (
                <div className="space-y-2">
                  <Label>Current images</Label>
                  <ul className="flex flex-wrap gap-2">
                    {[...editing.product_images]
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((img, index, array) => (
                        <li
                          key={img.id}
                          className="relative size-16 overflow-hidden rounded-md border"
                        >
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between p-1">
                            {index > 0 && (
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-4 w-4"
                                onClick={async () => {
                                  const prevImg = array[index - 1];
                                  const temp = img.sort_order;
                                  const supabase = createBrowserSupabaseClient();
                                  try {
                                    await supabase
                                      .from("product_images")
                                      .update({ sort_order: prevImg.sort_order })
                                      .eq("id", img.id);
                                    await supabase
                                      .from("product_images")
                                      .update({ sort_order: temp })
                                      .eq("id", prevImg.id);
                                    setProducts((prev) => prev.map((p) =>
                                      p.id === editingId
                                        ? {
                                            ...p,
                                            product_images: p.product_images.map((i) =>
                                              i.id === img.id
                                                ? { ...i, sort_order: prevImg.sort_order }
                                                : i.id === prevImg.id
                                                ? { ...i, sort_order: temp }
                                                : i
                                            ),
                                          }
                                        : p
                                    ));
                                  } catch (err) {
                                    console.log('Reorder error:', err);
                                    alert('Reorder failed: ' + (err instanceof Error ? err.message : 'Unknown'));
                                  }
                                }}
                              >
                                ↑
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-4 w-4 ml-auto"
                              aria-label="Remove image"
                              onClick={() => void removeImage(img.id, img.url)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="product-images">
                  {editingId ? "Add shared images" : "Images"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  These images are shown for all variants or when no variants are selected.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="cursor-pointer"
                    onChange={(e) =>
                      setFiles(Array.from(e.target.files ?? []))
                    }
                  />
                  <ImagePlus className="size-5 shrink-0 text-muted-foreground" />
                </div>

              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : editingId ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

export default ProductManager;

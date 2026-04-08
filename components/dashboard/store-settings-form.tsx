"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Upload } from "lucide-react";
import imageCompression from 'browser-image-compression';

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/slugify";
import type { DashboardStore } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  store: DashboardStore;
  ownerId: string;
};

async function uploadLogo(file: File, storeId: string): Promise<string> {
  const supabase = createBrowserSupabaseClient();

  // Compress the image
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };
  const compressedFile = await imageCompression(file, options);

  // Generate unique filename
  const fileExt = compressedFile.name.split('.').pop();
  const fileName = `logo-${Date.now()}.${fileExt}`;
  const filePath = `${storeId}/logo/${fileName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, compressedFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw new Error(error.message);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  if (!urlData.publicUrl) throw new Error('Failed to get public URL');

  return urlData.publicUrl;
}

const StoreSettingsForm = memo(function StoreSettingsForm({ store, ownerId }: Props) {
  const router = useRouter();
  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp_number ?? "");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 8) {
      setError("Enter a WhatsApp number with country code (e.g. +6731234567).");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const formattedWhatsapp = whatsapp.trim().startsWith("+")
      ? whatsapp.trim()
      : `+${digits}`;

    let logoUrl = store.logo_url;
    if (logoFile) {
      try {
        logoUrl = await uploadLogo(logoFile, store.id);
      } catch (uploadErr) {
        setError(uploadErr instanceof Error ? uploadErr.message : "Logo upload failed");
        setLoading(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        name: name.trim(),
        slug: slug.trim(),
        whatsapp_number: formattedWhatsapp,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id)
      .eq("owner_id", ownerId);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
    router.push("?tab=settings");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store settings</CardTitle>
        <CardDescription>
          Update how customers see your store and where WhatsApp orders are
          sent.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-muted-foreground" role="status">
              Saved.
            </p>
          ) : null}
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Public URL slug: </span>
            <span className="font-mono">{slug}</span>
            <Button variant="link" className="ml-2 h-auto p-0 text-sm" asChild>
              <Link href={`/${slug}`} target="_blank" rel="noreferrer">
                View storefront
                <ExternalLink className="ml-1 inline size-3" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-name">Store name</Label>
            <Input
              id="store-name"
              required
              value={name}
              onChange={(e) => {
              setName(e.target.value);
              setSlug(slugify(e.target.value));
            }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-whatsapp">WhatsApp number</Label>
            <Input
              id="store-whatsapp"
              required
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+6731234567"
            />
            <p className="text-xs text-muted-foreground">
              Enter full international number with country code (e.g., +6731234567). Used for WhatsApp order links.
            </p>
          </div>


            <div className="space-y-2">
              <Label htmlFor="store-logo">Store logo</Label>
            {store.logo_url ? (
              <div className="flex items-center gap-2">
                <Image src={store.logo_url} alt="Store logo" width={48} height={48} className="w-12 h-12 object-cover rounded" />
                <span className="text-sm text-muted-foreground">Current logo</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Input
                id="store-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="cursor-pointer"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
              <Upload className="size-5 shrink-0 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Upload a logo to display on your storefront.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
});

export default StoreSettingsForm;

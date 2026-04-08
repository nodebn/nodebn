"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BRAND_DOMAIN_PLACEHOLDER, BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/slugify";
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
  ownerId: string;
};

export function CreateStoreForm({ ownerId }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNameChange(value: string) {
    const previousAutoSlug = slugify(name);
    setName(value);
    if (!slug || slug === previousAutoSlug) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
      setError("Choose a valid store URL slug.");
      return;
    }
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

    // Check if user already has a store
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (existingStore) {
      setError("You already have a store. Please refresh the page.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("stores").insert({
      owner_id: ownerId,
      name: name.trim(),
      slug: normalizedSlug,
      whatsapp_number: formattedWhatsapp,
      is_active: true,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="border-dashed border-primary/30">
      <CardHeader>
        <CardTitle>Create your store</CardTitle>
        <CardDescription>
          You do not have a {BRAND_NAME} storefront yet. Set a name, public URL
          slug, and WhatsApp number to get started.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="new-store-name">Store name</Label>
            <Input
              id="new-store-name"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Acme Goods"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-store-slug">Store URL</Label>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">{BRAND_DOMAIN_PLACEHOLDER}/</span>
              <Input
                id="new-store-slug"
                required
                className="max-w-xs"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="acme-goods"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-store-whatsapp">WhatsApp number</Label>
            <Input
              id="new-store-whatsapp"
              required
              type="tel"
              inputMode="tel"
              placeholder="+6731234567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter full international number with country code (e.g., +6731234567). This number receives customer order messages.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create store"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

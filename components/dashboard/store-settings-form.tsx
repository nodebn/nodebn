"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
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

export function StoreSettingsForm({ store, ownerId }: Props) {
  const router = useRouter();
  const [name, setName] = useState(store.name);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp_number ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 8) {
      setError("Enter a WhatsApp number with country code (e.g. +15551234567).");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const formattedWhatsapp = whatsapp.trim().startsWith("+")
      ? whatsapp.trim()
      : `+${digits}`;

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        name: name.trim(),
        whatsapp_number: formattedWhatsapp,
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
            <span className="font-mono">{store.slug}</span>
            <Button variant="link" className="ml-2 h-auto p-0 text-sm" asChild>
              <Link href={`/${store.slug}`} target="_blank" rel="noreferrer">
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
              onChange={(e) => setName(e.target.value)}
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
              placeholder="+15551234567"
            />
            <p className="text-xs text-muted-foreground">
              International format (E.164). Used for checkout links.
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
}

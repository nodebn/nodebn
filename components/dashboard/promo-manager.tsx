"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export type DashboardPromo = {
  id: string;
  store_id: string;
  code: string;
  discount_type: "fixed" | "percentage";
  value: number;
  is_active: boolean;
};

type Props = {
  storeId: string;
  initialPromos: DashboardPromo[];
};

function normalizePromo(row: Record<string, unknown>): DashboardPromo {
  return {
    id: row.id as string,
    store_id: row.store_id as string,
    code: row.code as string,
    discount_type: row.discount_type as "fixed" | "percentage",
    value: row.value as number,
    is_active: Boolean(row.is_active),
  };
}

export function PromoManager({ storeId, initialPromos }: Props) {
  const router = useRouter();
  const [promos, setPromos] = useState<DashboardPromo[]>(initialPromos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPromos(initialPromos);
  }, [initialPromos]);

  function openCreate() {
    setEditingId(null);
    setCode("");
    setDiscountType("fixed");
    setValue("");
    setIsActive(true);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(p: DashboardPromo) {
    setEditingId(p.id);
    setCode(p.code);
    setDiscountType(p.discount_type);
    setValue(p.value.toString());
    setIsActive(p.is_active);
    setError(null);
    setDialogOpen(true);
  }

  async function handleDeletePromo(id: string) {
    const supabase = createBrowserSupabaseClient();
    const { error: delErr } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (delErr) {
      alert(delErr.message);
      return;
    }
    setPromos((prev) => prev.filter((p) => p.id !== id));
    router.push("?tab=promos");
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("Promo code is required.");
      return;
    }
    const numValue = parseInt(value);
    if (!Number.isFinite(numValue) || numValue <= 0) {
      setError("Enter a valid value.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    try {
      if (!editingId) {
        const { data: inserted, error: insErr } = await supabase
          .from("promo_codes")
          .insert({
            store_id: storeId,
            code: code.trim().toUpperCase(),
            discount_type: discountType,
            value: numValue,
            is_active: isActive,
          })
          .select()
          .single();

        if (insErr) throw insErr;
        if (!inserted) throw new Error("No promo returned");
        const row = normalizePromo(inserted as Record<string, unknown>);
        setPromos((prev) => [row, ...prev]);
      } else {
        const { error: upErr } = await supabase
          .from("promo_codes")
          .update({
            code: code.trim().toUpperCase(),
            discount_type: discountType,
            value: numValue,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("store_id", storeId);

        if (upErr) throw upErr;

        const { data: full, error: fetchErr } = await supabase
          .from("promo_codes")
          .select("*")
          .eq("id", editingId)
          .single();

        if (fetchErr) throw fetchErr;
        const row = normalizePromo(full as Record<string, unknown>);
        setPromos((prev) => prev.map((p) => (p.id === row.id ? row : p)));
      }

      setDialogOpen(false);
      router.push("?tab=promos");
      router.refresh();
    } catch (err: unknown) {
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
          <CardTitle>Promo Codes</CardTitle>
          <CardDescription>
            Create, edit, or remove promo codes for your {BRAND_NAME} checkout.
          </CardDescription>
        </div>
        <Button type="button" size="sm" className="gap-1" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Add promo
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {promos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No promo codes yet. Add your first promo.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {promos.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{p.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.discount_type === "fixed" ? formatMoney(p.value * 100, "BND") : `${p.value}% off`}
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
                    onClick={() => void handleDeletePromo(p.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg bg-background">
          <form onSubmit={(e) => void handleSave(e)}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit promo" : "New promo"}
              </DialogTitle>
              <DialogDescription>
                Set details for the promo code.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="promo-code">Code</Label>
                <Input
                  id="promo-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="SAVE10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-type">Discount Type</Label>
                <Select value={discountType} onValueChange={(v: "fixed" | "percentage") => setDiscountType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-value">Value ({discountType === "fixed" ? "BND" : "%"})</Label>
                <Input
                  id="promo-value"
                  required
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={discountType === "fixed" ? "10.00" : "10"}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="promo-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                />
                <Label htmlFor="promo-active" className="font-normal">
                  Active
                </Label>
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
}
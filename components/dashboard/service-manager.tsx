"use client";

import { useEffect, useState, memo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export type DashboardService = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  fee_cents: number;
  is_active: boolean;
};

type Props = {
  storeId: string;
  initialServices: DashboardService[];
  subscription?: { plan: string; status: string };
};

function normalizeService(row: Record<string, unknown>): DashboardService {
  return {
    id: row.id as string,
    store_id: row.store_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    fee_cents: row.fee_cents as number,
    is_active: Boolean(row.is_active),
  };
}

const ServiceManager = memo(function ServiceManager({ storeId, initialServices, subscription }: Props) {
  const router = useRouter();
  const [services, setServices] = useState<DashboardService[]>(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const getServiceLimit = () => {
    const plan = subscription?.plan || 'free';
    switch (plan) {
      case 'free': return 2;
      case 'starter': return 5;
      case 'professional': return 10;
      case 'enterprise': return Infinity;
      default: return 2;
    }
  };

  const serviceLimit = getServiceLimit();
  const canAddService = subscription ? services.length < serviceLimit : true;

  function openCreate() {
    setEditingId(null);
    setName("");
    setDescription("");
    setFee("");
    setIsActive(true);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(s: DashboardService) {
    setEditingId(s.id);
    setName(s.name);
    setDescription(s.description ?? "");
    setFee((s.fee_cents / 100).toFixed(2));
    setIsActive(s.is_active);
    setError(null);
    setDialogOpen(true);
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    const supabase = createBrowserSupabaseClient();
    const { error: delErr } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (delErr) {
      alert(delErr.message);
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    router.push("?tab=services");
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Service name is required.");
      return;
    }
    const feeCents = parseFloat(fee) * 100;
    if (!Number.isFinite(feeCents) || feeCents < 0) {
      setError("Enter a valid fee.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    try {
      if (!editingId) {
        const { data: inserted, error: insErr } = await supabase
          .from("services")
          .insert({
            store_id: storeId,
            name: name.trim(),
            description: description.trim() || null,
            fee_cents: feeCents,
            is_active: isActive,
          })
          .select()
          .single();

        if (insErr) throw insErr;
        if (!inserted) throw new Error("No service returned");
        const row = normalizeService(inserted as Record<string, unknown>);
        setServices((prev) => [row, ...prev]);
      } else {
        const { error: upErr } = await supabase
          .from("services")
          .update({
            name: name.trim(),
            description: description.trim() || null,
            fee_cents: feeCents,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("store_id", storeId);

        if (upErr) throw upErr;

        const { data: full, error: fetchErr } = await supabase
          .from("services")
          .select("*")
          .eq("id", editingId)
          .single();

        if (fetchErr) throw fetchErr;
        const row = normalizeService(full as Record<string, unknown>);
        setServices((prev) => prev.map((s) => (s.id === row.id ? row : s)));
      }

      setDialogOpen(false);
      router.push("?tab=services");
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
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Add delivery or pickup options for your {BRAND_NAME} store.
          </CardDescription>
          {subscription && (
            <p className="text-sm text-muted-foreground">
              {services.length}/{serviceLimit === Infinity ? '∞' : serviceLimit} services used
            </p>
          )}
          {subscription && !canAddService ? (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg dark:from-purple-950 dark:to-pink-950 dark:border-purple-800">
              <div className="text-purple-600 dark:text-purple-400">
                <span className="text-lg">🚚</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Service limit reached
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Upgrade to add more delivery methods
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-8 px-4 animate-pulse" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-upgrade'))}>
                <span>🚀</span>
                Unlock Now
              </Button>
            </div>
          ) : subscription && services.length >= serviceLimit * 0.8 && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg dark:from-blue-950 dark:to-cyan-950 dark:border-blue-800">
              <div className="text-blue-600 dark:text-blue-400">
                <span className="text-lg">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Approaching service limit
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Add more delivery options with an upgrade
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 h-8 px-4" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-upgrade'))}>
                <span>✨</span>
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
        <Button type="button" size="sm" className="gap-1" disabled={!canAddService} onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Add service
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No services yet. Add your first service.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.description} - {formatMoney(s.fee_cents, "BND")}
                    {!s.is_active ? (
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
                    onClick={() => openEdit(s)}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void handleDeleteService(s.id)}
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
                {editingId ? "Edit service" : "New service"}
              </DialogTitle>
              <DialogDescription>
                Set details for the service.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="service-name">Name</Label>
                <Input
                  id="service-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Description</Label>
                <Textarea
                  id="service-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[72px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-fee">Fee (BND)</Label>
                <Input
                  id="service-fee"
                  required
                  inputMode="decimal"
                  placeholder="5.00"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="service-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                />
                <Label htmlFor="service-active" className="font-normal">
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
});

export default ServiceManager;
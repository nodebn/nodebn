"use client";

import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";


import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
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

export type DashboardPayment = {
  id: string;
  store_id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active: boolean;
};

type Props = {
  storeId: string;
  initialPayments: DashboardPayment[];
  subscription?: { plan: string; status: string };
};

const BRUNEI_BANKS = [
  'Baiduri Bank',
  'Bank Islam Brunei Darussalam',
  'Bank of Brunei',
  'CIMB Bank Brunei',
  'HSBC Brunei',
  'Maybank Brunei',
  'Standard Chartered Brunei',
];

function normalizePayment(row: Record<string, unknown>): DashboardPayment {
  return {
    id: row.id as string,
    store_id: row.store_id as string,
    bank_name: row.bank_name as string,
    account_number: row.account_number as string,
    account_holder: row.account_holder as string,
    is_active: Boolean(row.is_active),
  };
}

const PaymentManager = memo(function PaymentManager({ storeId, initialPayments, subscription }: Props) {
  const router = useRouter();
  const [payments, setPayments] = useState<DashboardPayment[]>(initialPayments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const getPaymentLimit = () => {
    const plan = subscription?.plan || 'free';
    switch (plan) {
      case 'free': return 1;
      case 'starter': return 2;
      case 'professional': return 5;
      case 'enterprise': return Infinity;
      default: return 1;
    }
  };

  const paymentLimit = getPaymentLimit();
  const canAddPayment = payments.length < paymentLimit;

  function openCreate() {
    setEditingId(null);
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setIsActive(true);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(p: DashboardPayment) {
    setEditingId(p.id);
    setBankName(p.bank_name);
    setAccountNumber(p.account_number);
    setAccountHolder(p.account_holder);
    setIsActive(p.is_active);
    setError(null);
    setDialogOpen(true);
  }

  async function handleDeletePayment(id: string) {
    if (!confirm("Delete this payment method?")) return;
    const supabase = createBrowserSupabaseClient();
    const { error: delErr } = await supabase
      .from("payments")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (delErr) {
      alert(delErr.message);
      return;
    }
    setPayments((prev) => prev.filter((p) => p.id !== id));
    router.push("?tab=payments");
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!bankName || !accountNumber.trim() || !accountHolder.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!BRUNEI_BANKS.includes(bankName)) {
      setError("Invalid bank selected.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    try {
      if (!editingId) {
        const { data: inserted, error: insErr } = await supabase
          .from("payments")
          .insert({
            store_id: storeId,
            bank_name: bankName,
            account_number: accountNumber.trim(),
            account_holder: accountHolder.trim(),
            is_active: isActive,
          })
          .select()
          .single();

        if (insErr) throw insErr;
        if (!inserted) throw new Error("No payment returned");
        const row = normalizePayment(inserted as Record<string, unknown>);
        setPayments((prev) => [row, ...prev]);
      } else {
        const { error: upErr } = await supabase
          .from("payments")
          .update({
            bank_name: bankName,
            account_number: accountNumber.trim(),
            account_holder: accountHolder.trim(),
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("store_id", storeId);

        if (upErr) throw upErr;

        const { data: full, error: fetchErr } = await supabase
          .from("payments")
          .select("*")
          .eq("id", editingId)
          .single();

        if (fetchErr) throw fetchErr;
        const row = normalizePayment(full as Record<string, unknown>);
        setPayments((prev) => prev.map((p) => (p.id === row.id ? row : p)));
      }

      setDialogOpen(false);
      router.push("?tab=payments");
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
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Add bank accounts for customers to make payments.
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            {payments.length}/{paymentLimit === Infinity ? '∞' : paymentLimit} payments used
          </p>
          {!canAddPayment ? (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg dark:from-rose-950 dark:to-pink-950 dark:border-rose-800">
              <div className="text-rose-600 dark:text-rose-400">
                <span className="text-lg">🏦</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
                  Payment method limit reached
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Upgrade to add more payment methods
                </p>
              </div>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 h-8 px-4 animate-pulse" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))}>
                <span>🔓</span>
                Unlock Now
              </Button>
            </div>
          ) : payments.length >= paymentLimit * 0.8 && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg dark:from-violet-950 dark:to-purple-950 dark:border-violet-800">
              <div className="text-violet-600 dark:text-violet-400">
                <span className="text-lg">💳</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                  Approaching payment method limit
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  Add more bank accounts with an upgrade
                </p>
              </div>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 h-8 px-4" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))}>
                <span>💰</span>
                Upgrade Now
              </Button>
            </div>
          )}
          {!canAddPayment && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg dark:from-rose-950 dark:to-pink-950 dark:border-rose-800">
              <div className="text-rose-600 dark:text-rose-400">
                <span className="text-lg">🏦</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
                  Payment limit reached
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Upgrade to add more payment methods
                </p>
              </div>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0 h-8 px-4 animate-pulse" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-upgrade-modal'))}>
                <span>🔓</span>
                Unlock Now
              </Button>
            </div>
          )}
        </div>
        <Button type="button" size="sm" className="gap-1" disabled={!canAddPayment} onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Add payment
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payment methods yet. Add your first bank account.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{p.bank_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Account: {p.account_number} ({p.account_holder})
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
                    onClick={() => void handleDeletePayment(p.id)}
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
                {editingId ? "Edit payment" : "New payment"}
              </DialogTitle>
              <DialogDescription>
                Add bank account details for Brunei banks.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="payment-bank">Bank</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brunei bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRUNEI_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-account">Account Number</Label>
                <Input
                  id="payment-account"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-holder">Account Holder Name</Label>
                <Input
                  id="payment-holder"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="payment-active"
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                />
                <Label htmlFor="payment-active" className="font-normal">
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

export default PaymentManager;
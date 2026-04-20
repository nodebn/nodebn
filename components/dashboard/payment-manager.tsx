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
  'Standard Chartered Brunei',
  'TAIB',
  'BIBD VCARD',
  'Cash Upon Delivery',
];

const BANK_LOGOS: Record<string, string> = {
  'Baiduri Bank': '/images/banks/baiduri.svg',
  'Bank Islam Brunei Darussalam': '/images/banks/bibd.jpg',
  'Standard Chartered Brunei': '/images/banks/scb.png',
  'TAIB': '/images/banks/taib.png',
  'BIBD VCARD': '/images/banks/bibd-vcard.jpg',
  'Cash Upon Delivery': '/images/banks/cod.png',
};

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
  const canAddPayment = subscription ? payments.length < paymentLimit : true;


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
    if (!storeId) {
      setError("No store found. Please verify your account or contact support.");
      return;
    }
    if (!bankName) {
      setError("Payment method is required.");
      return;
    }
    if (bankName !== 'Cash Upon Delivery' && (!accountNumber.trim() || !accountHolder.trim())) {
      setError("Account number and holder are required for this payment method.");
      return;
    }
    if (!BRUNEI_BANKS.includes(bankName)) {
      setError("Invalid payment method selected.");
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
      console.error("Payment save error:", err);
      const msg = (err as any)?.message || (err instanceof Error ? err.message : "Something went wrong.");
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
          Add payment methods for customers to make payments
        </CardDescription>
          {subscription && (
            <p className="text-sm text-muted-foreground">
              {payments.length}/{paymentLimit === Infinity ? '∞' : paymentLimit} payments used
            </p>
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
            No payment methods yet. Add your first payment method.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {p.bank_name === 'Cash Upon Delivery' ? '💵' : (
                      <img
                        src={BANK_LOGOS[p.bank_name]}
                        alt={p.bank_name}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <p className="font-medium leading-tight">{p.bank_name}</p>
                  </div>
                  {p.bank_name !== 'Cash Upon Delivery' && (
                    <p className="text-sm text-muted-foreground">
                      {p.bank_name === 'BIBD VCARD' ? 'Phone' : 'Account'}: {p.account_number} ({p.account_holder})
                    </p>
                  )}
                  {!p.is_active ? (
                    <span className="ml-2 text-amber-600 dark:text-amber-400">
                      Hidden
                    </span>
                  ) : null}
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
                Add payment method details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="payment-bank">Payment Method</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRUNEI_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        <div className="flex items-center gap-2">
                          {bank === 'Cash Upon Delivery' ? '💵' : (
                            <img
                              src={BANK_LOGOS[bank]}
                              alt={bank}
                              className="w-7 h-7 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          {bank}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {bankName !== 'Cash Upon Delivery' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="payment-account">
                      {bankName === 'BIBD VCARD' ? 'VCard Phone Number' : 'Account Number'}
                    </Label>
                    <Input
                      id="payment-account"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={bankName === 'BIBD VCARD' ? '8881234' : '1234567890'}
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
                </>
              )}
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
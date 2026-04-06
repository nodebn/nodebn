"use client";

import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { BRAND_NAME } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { DashboardCategory } from "@/components/dashboard/types";
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

type Props = {
  storeId: string;
  initialCategories: DashboardCategory[];
  onCategoriesChange: () => void;
  subscription?: { plan: string; status: string };
};

const CategoryManager = memo(function CategoryManager({
  storeId,
  initialCategories,
  onCategoriesChange,
  subscription,
}: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<DashboardCategory[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);

      // Update sort_order
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        sort_order: index + 1,
      }));

      setCategories(updatedCategories);

      // Save to DB
      const supabase = createBrowserSupabaseClient();
      const updates = updatedCategories.map((cat) => ({
        id: cat.id,
        sort_order: cat.sort_order,
      }));

      Promise.all(
        updates.map((update) =>
          supabase
            .from("categories")
            .update({ sort_order: update.sort_order })
            .eq("id", update.id)
        )
      ).catch((err) => {
        console.error("Failed to update sort_order:", err);
        // Revert on error
        setCategories(initialCategories);
      });

      onCategoriesChange?.();
    }
  }

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const getCategoryLimit = () => {
    const plan = subscription?.plan || 'free';
    switch (plan) {
      case 'free': return 3;
      case 'starter': return 5;
      case 'professional': return 15;
      case 'enterprise': return Infinity;
      default: return 3;
    }
  };

  const categoryLimit = getCategoryLimit();
  const canAddCategory = subscription ? categories.length < categoryLimit : true;

  function openCreate() {
    setEditingId(null);
    setName("");
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(c: DashboardCategory) {
    setEditingId(c.id);
    setName(c.name);
    setError(null);
    setDialogOpen(true);
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category? Products will remain uncategorized.")) return;
    const supabase = createBrowserSupabaseClient();
    const { error: delErr } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (delErr) {
      alert(delErr.message);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.push("?tab=categories");
    router.refresh();
    onCategoriesChange?.();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    try {
      if (!editingId) {
        // Get max sort_order
        const { data: maxOrder } = await supabase
          .from("categories")
          .select("sort_order")
          .eq("store_id", storeId)
          .order("sort_order", { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (maxOrder?.sort_order || 0) + 1;

        const { data: inserted, error: insErr } = await supabase
          .from("categories")
          .insert({
            store_id: storeId,
            name: trimmedName,
            sort_order: nextOrder,
          })
          .select()
          .single();

        if (insErr) throw insErr;
        if (!inserted) throw new Error("No category returned");
        setCategories((prev) => [...prev, inserted as DashboardCategory]);
      } else {
        const { error: upErr } = await supabase
          .from("categories")
          .update({
            name: trimmedName,
          })
          .eq("id", editingId)
          .eq("store_id", storeId);

        if (upErr) throw upErr;
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, name: trimmedName } : c)),
        );
      }

      setDialogOpen(false);
      router.push("?tab=categories");
      router.refresh();
      onCategoriesChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function SortableItem({ category }: { category: DashboardCategory }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        className={`flex flex-wrap items-center justify-between p-3 sm:flex-nowrap ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
            aria-label="Reorder category"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-tight">{category.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => openEdit(category)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => void handleDeleteCategory(category.id)}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      </li>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Organize your {BRAND_NAME} products with categories for better storefront filtering.
          </CardDescription>
          {subscription && (
            <p className="text-sm text-muted-foreground">
              {categories.length}/{categoryLimit === Infinity ? '∞' : categoryLimit} categories used
            </p>
          )}
          {subscription && !canAddCategory ? (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg dark:from-slate-950 dark:to-gray-950 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400">
                <span className="text-lg">📁</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Category limit reached
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Upgrade to create more categories
                </p>
              </div>
              <Button className="bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-600 hover:to-gray-600 text-white border-0 h-8 px-4 animate-pulse" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-upgrade'))}>
                <span>🗂️</span>
                Unlock Now
              </Button>
            </div>
          ) : subscription && categories.length >= categoryLimit * 0.8 && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg dark:from-teal-950 dark:to-cyan-950 dark:border-teal-800">
              <div className="text-teal-600 dark:text-teal-400">
                <span className="text-lg">📂</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                  Approaching category limit
                </p>
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  Organize more products with an upgrade
                </p>
              </div>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 h-8 px-4" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-upgrade'))}>
                <span>📁</span>
                Upgrade Now
              </Button>
            </div>
          )}
        </div>
        <Button type="button" size="sm" className="gap-1" disabled={!canAddCategory} onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          Add category
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories yet. Add your first category to organize products.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y rounded-lg border">
                {categories.map((c) => (
                  <SortableItem key={c.id} category={c} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background">
          <form onSubmit={(e) => void handleSave(e)}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit category" : "New category"}
              </DialogTitle>
              <DialogDescription>
                Categories help customers filter products on your storefront.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
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

export default CategoryManager;
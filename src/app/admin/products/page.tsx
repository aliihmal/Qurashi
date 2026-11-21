"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { getAllProducts, deleteProduct } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAllProducts,
    retry: false,
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories, retry: false });

  const catNames = useMemo(() => {
    const names = (categories?.length
      ? categories.map((c) => c.name)
      : Array.from(new Set((products ?? []).map((p) => p.category).filter((c): c is string => !!c)))
    ).filter((c): c is string => !!c);
    return ["all", ...names];
  }, [categories, products]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, category]);

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleting(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Products</h1>
          <p className="text-sm text-muted">Manage your catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="gold">
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-md border border-ink/15 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            aria-label="Search products"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {catNames.map((c) => (
              <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>Category</TH>
                  <TH>Price</TH>
                  <TH>Stock</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="py-12 text-center text-muted">
                      No products found.
                    </TD>
                  </TR>
                ) : (
                  filtered.map((p) => {
                    const out = p.inStock === false || (p.stock !== undefined && p.stock <= 0);
                    return (
                      <TR key={p.id}>
                        <TD className="font-medium">{p.name}</TD>
                        <TD>{p.category}</TD>
                        <TD>{formatPrice(p.price)}</TD>
                        <TD>
                          <span className={out ? "text-clay" : "text-success"}>
                            {out ? "Out of stock" : (p.stock ?? "In stock")}
                          </span>
                        </TD>
                        <TD>
                          <div className="flex justify-end gap-1">
                            <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`}>
                              <Button size="icon" variant="ghost">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Delete ${p.name}`}
                              onClick={() => setDeleting(p.id)}
                            >
                              <Trash2 className="h-4 w-4 text-clay" />
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    );
                  })
                )}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              This will permanently remove the product from your store. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

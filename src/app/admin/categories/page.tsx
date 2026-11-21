"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { getCategories, deleteCategory } from "@/lib/api/categories";
import { getAllProducts } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    retry: false,
  });
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: getAllProducts, retry: false });

  function productCount(collectionId: string) {
    return (products ?? []).filter((p) => p.collectionId === collectionId).length;
  }

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleting(null);
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Categories</h1>
        <p className="text-sm text-muted">Collections that group your products</p>
      </div>

      <p className="rounded-md border border-border bg-surface-muted/40 px-4 py-3 text-sm text-muted">
        The backend only supports listing and deleting collections right now — creating
        or renaming categories isn&apos;t available yet.
      </p>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Description</TH>
                  <TH>Products</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {(categories ?? []).length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="py-12 text-center text-muted">
                      No categories yet.
                    </TD>
                  </TR>
                ) : (
                  (categories ?? []).map((cat) => (
                    <TR key={cat.id}>
                      <TD className="font-medium">{cat.name}</TD>
                      <TD className="max-w-xs truncate text-muted">{cat.description ?? "—"}</TD>
                      <TD>{productCount(cat.id)}</TD>
                      <TD>
                        <div className="flex justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${cat.name}`}
                            onClick={() => setDeleting(cat.id)}
                          >
                            <Trash2 className="h-4 w-4 text-clay" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              Products in this collection may become uncategorized. This cannot be undone.
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

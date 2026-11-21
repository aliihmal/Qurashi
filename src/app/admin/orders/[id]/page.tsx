"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { adminGetOrder, getOrderItems, deleteOrder } from "@/lib/api/orders";
import { getAllProducts } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

export default function AdminOrderDetailsPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminGetOrder(id),
    retry: false,
  });
  const { data: cartRows } = useQuery({
    queryKey: ["order-items", id],
    queryFn: () => getOrderItems(id),
    enabled: !!order,
    retry: false,
  });
  const { data: products } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getAllProducts,
    retry: false,
  });

  const productMap = new Map<string, Product>((products ?? []).map((p) => [p.id, p]));

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Order deleted");
      setConfirmDelete(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="font-serif text-xl">Order not found</p>
          <Link href="/admin/orders" className="mt-4 inline-block text-sm text-gold-dark underline">
            Back to orders
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="rounded-md p-2 hover:bg-sand" aria-label="Back to orders">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
          Order #{order.id.replace(/^[^:]*:/, "").slice(-8).toUpperCase()}
        </h1>
        <Button
          size="sm"
          variant="destructive"
          className="ml-auto"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" /> Delete order
        </Button>
      </div>

      <p className="text-sm text-muted">
        The backend doesn&apos;t track order status or delivery details yet — status
        management will be available once the API supports it.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="break-all"><span className="font-medium">ID:</span> {order.id}</p>
            <p><span className="font-medium">Customer:</span> {order.userId}</p>
            <p><span className="font-medium">Total:</span> {formatPrice(order.price ?? order.total ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items ({cartRows?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!cartRows ? (
              <Skeleton className="h-20 w-full" />
            ) : cartRows.length === 0 ? (
              <p className="text-sm text-muted">No item details available.</p>
            ) : (
              <ul className="divide-y divide-ink/8">
                {cartRows.map((row) => {
                  const p = productMap.get(row.product_id);
                  const unit = p?.onSale && p.salePrice ? p.salePrice : (p?.price ?? 0);
                  return (
                    <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span>
                        {p?.name ?? row.product_id}{" "}
                        <span className="text-muted">× {row.quantity}</span>
                      </span>
                      <span className="font-medium">{formatPrice(unit * row.quantity)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete order</DialogTitle>
            <DialogDescription>
              This will permanently delete the order and its items. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

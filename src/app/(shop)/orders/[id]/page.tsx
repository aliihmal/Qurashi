"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { orderStatusVariant } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

const TRACKED: OrderStatus[] = ["Pending", "Approved", "Processing", "Shipped", "Delivered"];

export default function OrderDetailsPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = use(params);
  const user = useAppSelector((s) => s.auth.user);
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id, user?.id),
    enabled: !!user,
    retry: false,
  });

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : isError || !order ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="font-serif text-xl">Order not found</p>
              <Link href="/account/orders" className="mt-4 inline-block text-sm text-gold-dark underline underline-offset-4">
                Back to orders
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl font-semibold">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <Badge variant={orderStatusVariant(order.status)} className="text-sm">
                {order.status}
              </Badge>
            </div>

            {/* Status tracker — only when the backend reports a tracked status */}
            {TRACKED.includes(order.status as OrderStatus) && order.status !== "Cancelled" && (
              <Card className="mb-6">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    {TRACKED.map((s, i) => {
                      const currentIdx = TRACKED.indexOf(order.status as OrderStatus);
                      const done = currentIdx >= 0 && i <= currentIdx;
                      return (
                        <div key={s} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              done ? "bg-gold text-white" : "bg-sand text-muted"
                            }`}
                          >
                            {done ? <Check className="h-4 w-4" /> : i + 1}
                          </div>
                          <span className={`text-[11px] font-medium ${done ? "text-ink" : "text-muted"}`}>
                            {s}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            {order.status === "Cancelled" && (
              <Card className="mb-6 border-error/30 bg-error/10">
                <CardContent className="py-4 text-sm text-error">
                  This order was cancelled.
                </CardContent>
              </Card>
            )}

            {/* Items */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-ink/8">
                  {order.items?.map((item, i) => (
                    <li key={i} className="flex items-center gap-4 py-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-sand" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-ink/10 pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-serif text-xl font-semibold">{formatPrice(order.total ?? order.price ?? 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-ink-soft">
                <p><span className="font-medium text-ink">Name:</span> {order.customerName}</p>
                {order.customerPhone && (
                  <p><span className="font-medium text-ink">Phone:</span> {order.customerPhone}</p>
                )}
                {order.customerEmail && (
                  <p><span className="font-medium text-ink">Email:</span> {order.customerEmail}</p>
                )}
                {order.address && (
                  <p><span className="font-medium text-ink">Address:</span> {order.address}</p>
                )}
                {order.createdAt && (
                  <p className="pt-2 text-xs text-muted">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleString("en-US", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RequireAuth>
  );
}

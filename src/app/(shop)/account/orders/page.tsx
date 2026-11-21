"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { getMyOrders } from "@/lib/api/orders";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { orderStatusVariant } from "@/lib/order-status";

export default function OrderHistoryPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => getMyOrders(user!.id),
    enabled: !!user,
    retry: false,
  });

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="mb-8 font-serif text-3xl font-semibold">Order History</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : isError || !orders || orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="font-serif text-xl">No orders yet</p>
              <p className="mt-1 text-sm text-muted">When you place an order, it will appear here.</p>
              <Link
                href="/products"
                className="mt-5 inline-block text-sm font-medium text-gold-dark underline underline-offset-4"
              >
                Start shopping
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="transition-shadow hover:shadow-lift">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</span>
                        <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date unavailable"}{" "}
                        · {order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="font-semibold">{formatPrice(order.total ?? order.price ?? 0)}</span>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}

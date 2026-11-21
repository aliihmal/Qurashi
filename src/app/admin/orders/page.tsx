"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getAllOrders } from "@/lib/api/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAllOrders(),
    retry: false,
  });

  const filtered = useMemo(() => {
    let list = orders ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || o.userId?.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b.id.localeCompare(a.id));
  }, [orders, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Orders</h1>
        <p className="text-sm text-muted">Review and manage customer orders</p>
      </div>

      <div className="relative sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order or user ID…"
          className="h-10 w-full rounded-md border border-ink/15 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          aria-label="Search orders"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="py-12 text-center text-muted">Failed to load orders.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Total</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.length === 0 ? (
                  <TR>
                    <TD colSpan={3} className="py-12 text-center text-muted">
                      No orders yet.
                    </TD>
                  </TR>
                ) : (
                  filtered.map((o) => (
                    <TR key={o.id}>
                      <TD>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium hover:text-gold-dark"
                        >
                          #{o.id.replace(/^[^:]*:/, "").slice(-8).toUpperCase()}
                        </Link>
                      </TD>
                      <TD className="text-muted">{o.userId ?? "—"}</TD>
                      <TD>{formatPrice(o.price ?? o.total ?? 0)}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

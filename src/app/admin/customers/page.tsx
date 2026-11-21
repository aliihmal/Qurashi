"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getCustomers } from "@/lib/api/admin";
import { getAllOrders } from "@/lib/api/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: getCustomers,
    retry: false,
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAllOrders(),
    retry: false,
  });

  // Enrich customers with order stats derived from orders list
  const enriched = useMemo(() => {
    return (customers ?? []).map((c) => {
      const cOrders = (orders ?? []).filter((o) => o.userId === c.id || o.customerEmail === c.email);
      return {
        ...c,
        orderCount: c.totalOrders ?? cOrders.length,
        totalSpent: c.totalSpent ?? cOrders.reduce((s, o) => s + (o.total ?? 0), 0),
      };
    });
  }, [customers, orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return enriched;
    const q = search.trim().toLowerCase();
    return enriched.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        (c as { phone?: string }).phone?.toLowerCase().includes(q),
    );
  }, [enriched, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Customers</h1>
        <p className="text-sm text-muted">Registered accounts and activity</p>
      </div>

      <p className="rounded-md border border-border bg-surface-muted/40 px-4 py-3 text-sm text-muted">
        The backend doesn&apos;t expose a customer-list endpoint yet, so this view is
        currently empty. Customer accounts can be looked up individually by ID.
      </p>

      <div className="relative sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers…"
          className="h-10 w-full rounded-md border border-ink/15 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          aria-label="Search customers"
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
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Orders</TH>
                  <TH>Total spent</TH>
                  <TH>Joined</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="py-12 text-center text-muted">
                      No customers found.
                    </TD>
                  </TR>
                ) : (
                  filtered.map((c) => (
                    <TR key={c.id}>
                      <TD>
                        <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-gold-dark">
                          {c.name}
                        </Link>
                      </TD>
                      <TD className="text-muted">{c.email}</TD>
                      <TD className="text-muted">{(c as { phone?: string }).phone ?? "—"}</TD>
                      <TD>{c.orderCount ?? 0}</TD>
                      <TD>{formatPrice(c.totalSpent ?? 0)}</TD>
                      <TD className="text-muted">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </TD>
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

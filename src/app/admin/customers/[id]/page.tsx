"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getCustomer } from "@/lib/api/admin";
import { getAllOrders } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { orderStatusVariant } from "@/lib/order-status";

export default function AdminCustomerDetailsPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = use(params);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => getCustomer(id),
    retry: false,
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAllOrders(),
    retry: false,
  });

  const customerOrders = (orders ?? []).filter(
    (o) => o.userId === id || o.customerEmail === customer?.email,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="font-serif text-xl">Customer not found</p>
          <Link href="/admin/customers" className="mt-4 inline-block text-sm text-gold-dark underline">
            Back to customers
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers" className="rounded-md p-2 hover:bg-sand" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{customer.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <p><span className="font-medium">Email:</span> {customer.email}</p>
          <p><span className="font-medium">Phone:</span> {(customer as { phone?: string }).phone ?? "—"}</p>
          <p><span className="font-medium">Role:</span> {customer.role}</p>
          {customer.status && <p><span className="font-medium">Status:</span> {customer.status}</p>}
          <p><span className="font-medium">Joined:</span> {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order history ({customerOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Date</TH>
                <TH>Total</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {customerOrders.length === 0 ? (
                <TR>
                  <TD colSpan={4} className="py-10 text-center text-muted">No orders yet.</TD>
                </TR>
              ) : (
                customerOrders.map((o) => (
                  <TR key={o.id}>
                    <TD>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-gold-dark">
                        #{o.id.slice(-8).toUpperCase()}
                      </Link>
                    </TD>
                    <TD>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</TD>
                    <TD>{formatPrice(o.total ?? o.price ?? 0)}</TD>
                    <TD><Badge variant={orderStatusVariant(o.status)}>{o.status ?? "Placed"}</Badge></TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

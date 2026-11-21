"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getDashboardStats } from "@/lib/api/admin";
import { getAllOrders } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingCart, Users, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getDashboardStats(),
    retry: false,
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAllOrders(),
    retry: false,
  });

  const recentOrders = (stats?.recentOrders ?? orders ?? []).slice(0, 6);
  const bestSellers = stats?.bestSellers ?? [];
  const chartData = stats?.salesChart ?? [];

  const cards = [
    { label: "Total revenue", value: formatPrice(stats?.revenue ?? 0), icon: DollarSign },
    { label: "Total orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart },
    { label: "Pending orders", value: stats?.pendingOrders ?? 0, icon: Clock },
    { label: "Customers", value: stats?.totalCustomers ?? 0, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted">Store performance at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-lg bg-gold/15 p-3 text-gold-dark">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">{c.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-6 w-16" />
                ) : (
                  <p className="font-serif text-xl font-semibold">{c.value}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales overview</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b08d57" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#b08d57" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#b08d57" fill="url(#goldFill)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted">No sales data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best-selling products</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bestSellers.map((b) => ({ name: b.product.name, qty: b.quantity }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="qty" fill="#1c1917" radius={[0, 4, 4, 0]} name="Units sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent orders</CardTitle>
          <Link href="/admin/orders" className="text-sm font-medium text-gold-dark hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Customer</TH>
                <TH>Date</TH>
                <TH>Total</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {recentOrders.length === 0 ? (
                <TR>
                  <TD colSpan={5} className="py-10 text-center text-muted">
                    No orders yet.
                  </TD>
                </TR>
              ) : (
                recentOrders.map((o) => (
                  <TR key={o.id}>
                    <TD>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-gold-dark">
                        #{o.id.replace(/^[^:]*:/, "").slice(-8).toUpperCase()}
                      </Link>
                    </TD>
                    <TD className="text-muted">{o.userId ?? "—"}</TD>
                    <TD className="text-muted">—</TD>
                    <TD>{formatPrice(o.price ?? o.total ?? 0)}</TD>
                    <TD>
                      <Badge variant="gold">Placed</Badge>
                    </TD>
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

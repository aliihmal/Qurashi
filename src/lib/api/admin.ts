import { api } from "@/lib/api";
import type { Customer, DashboardStats } from "@/lib/types";
import { getAllOrders } from "@/lib/api/orders";
import { getAllProducts } from "@/lib/api/products";

// The backend has no dedicated admin stats/customers endpoints.
// Dashboard stats are derived client-side from orders + products.
export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, products] = await Promise.all([getAllOrders(), getAllProducts()]);

  const revenue = orders.reduce((s, o) => s + (o.price ?? o.total ?? 0), 0);

  // Best sellers derived from order items is not possible (orders lack items
  // server-side), so fall back to products flagged on sale / all products.
  const bestSellers = products.slice(0, 5).map((p) => ({
    product: p,
    quantity: p.stock ?? 0,
    revenue: p.price,
  }));

  return {
    totalSales: orders.length,
    revenue,
    totalOrders: orders.length,
    pendingOrders: 0,
    totalCustomers: 0,
    salesChart: [],
    bestSellers,
    recentOrders: orders.slice(0, 6),
  };
}

// TODO: backend has no customer-list endpoint (only GET /user/getById/:id).
export async function getCustomers(): Promise<Customer[]> {
  return [];
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<{ user: Customer }>(`/user/getById/${id}`);
  return data.user;
}

export async function updateCustomerStatus(_id: string, _status: string) {
  void _id;
  void _status;
  throw new Error("Customer management is not supported by the backend API yet");
}

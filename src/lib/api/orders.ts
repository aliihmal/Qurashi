import { api } from "@/lib/api";
import { getAllProducts } from "@/lib/api/products";
import type { CartRow, Order, OrderItem, Product } from "@/lib/types";

// ---- Backend cart ----

export async function addToBackendCart(userId: string, productId: string, quantity = 1) {
  // Backend increments quantity by 1 per call and merges same product+size,
  // so N calls yield one cart row with quantity N. Returns unique cart ids.
  const ids = new Set<string>();
  for (let i = 0; i < Math.max(1, quantity); i++) {
    const { data } = await api.post<CartRow>(`/cart/add/${userId}`, { productId, size: "standard" });
    ids.add(data.id);
  }
  return [...ids];
}

export async function getUserCart(userId: string): Promise<CartRow[]> {
  const { data } = await api.get<CartRow[] | { carts?: CartRow[] }>(`/cart/getByUser/${userId}`);
  return Array.isArray(data) ? data : (data.carts ?? []);
}

export async function deleteCartItem(id: string) {
  const { data } = await api.delete<{ message: string }>(`/cart/deletecart/${id}`);
  return data;
}

// ---- Orders ----

interface CreateOrderResponse {
  messge?: string;
  message?: string;
  order?: string; // backend returns the new order id
}

export async function createOrder(userId: string, cartIds: string[]) {
  const { data } = await api.post<CreateOrderResponse>(`/order/${userId}`, { ids: cartIds });
  return data;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await api.get<{ orders?: Order[] }>("/order/getAll");
  return data.orders ?? [];
}

export async function deleteOrder(id: string) {
  const { data } = await api.delete<{ message: string }>(`/order/deleteOrder/${id}`);
  return data;
}

export async function getOrderItems(orderId: string): Promise<CartRow[]> {
  const { data } = await api.get<{ carts?: CartRow[] }>(`/cartOrder/getByOrderId/${orderId}`);
  return data.carts ?? [];
}

// ---- Customer-facing helpers ----

// The backend has no "my orders" endpoint. We reconstruct the customer's
// orders from their cart rows that were converted into orders (orderId set),
// enriched with product details. Requires the backend to expose order linkage;
// returns [] when unavailable.
export async function getMyOrders(userId: string): Promise<Order[]> {
  const carts = await getUserCart(userId);
  const byOrder = new Map<string, CartRow[]>();
  for (const c of carts) {
    if (!c.orderId) continue;
    const list = byOrder.get(c.orderId) ?? [];
    list.push(c);
    byOrder.set(c.orderId, list);
  }
  if (byOrder.size === 0) return [];

  const products = await getAllProducts().catch(() => [] as Product[]);
  const productMap = new Map(products.map((p) => [p.id, p]));

  return Array.from(byOrder.entries()).map(([orderId, rows]) => {
    const items: OrderItem[] = rows.map((r) => {
      const p = productMap.get(r.product_id);
      const unit = p?.onSale && p.salePrice ? p.salePrice : (p?.price ?? 0);
      return {
        productId: r.product_id,
        name: p?.name ?? r.product_id,
        price: unit,
        quantity: r.quantity,
        imgSrc: p?.imgSrc,
        size: r.size,
      };
    });
    return {
      id: orderId,
      userId,
      price: items.reduce((s, i) => s + i.price * i.quantity, 0),
      total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      items,
      status: "Placed",
    };
  });
}

export async function getOrderById(orderId: string, userId?: string): Promise<Order | null> {
  const rows = await getOrderItems(orderId);
  if (rows.length === 0) return null;

  const products = await getAllProducts().catch(() => [] as Product[]);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items: OrderItem[] = rows.map((r) => {
    const p = productMap.get(r.product_id);
    const unit = p?.onSale && p.salePrice ? p.salePrice : (p?.price ?? 0);
    return {
      productId: r.product_id,
      name: p?.name ?? r.product_id,
      price: unit,
      quantity: r.quantity,
      imgSrc: p?.imgSrc,
      size: r.size,
    };
  });

  return {
    id: orderId,
    userId: userId ?? rows[0]?.user_id ?? "",
    price: items.reduce((s, i) => s + i.price * i.quantity, 0),
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    items,
    status: "Placed",
  };
}

// Admin helpers

export async function adminGetOrder(id: string): Promise<Order | null> {
  const orders = await getAllOrders();
  return orders.find((o) => o.id === id) ?? null;
}

// TODO: backend has no order-status update endpoint yet.
export async function updateOrderStatus(_id: string, _status: string) {
  void _id;
  void _status;
  throw new Error("Order status updates are not supported by the backend API yet");
}

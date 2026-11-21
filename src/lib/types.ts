export type Role = "user" | "admin" | "guest" | "manager" | string;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  onSale?: boolean;
  stock?: number;
  collectionId?: string | null;
  imgSrc?: string;
  images?: string[];
  category?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
}

export type OrderStatus =
  | "Pending"
  | "Approved"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Placed"
  | string;

/** Backend order model is minimal: { id, userId, price } */
export interface Order {
  id: string;
  userId: string;
  price: number;
  // Optional fields the frontend derives or that may exist in future backend versions
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imgSrc?: string;
  size?: string;
}

/** Backend cart row (also used for cartOrder rows) */
export interface CartRow {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  quantity: number;
  orderId: string | null;
}

export interface Customer extends User {
  createdAt?: string;
  status?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface Category {
  id?: string;
  name: string;
  slug?: string;
  productCount?: number;
}

/** Backend "collection" entity (used like a category/grouping) */
export interface Collection {
  id: string;
  name: string;
  description?: string;
  imgSrc?: string;
  price?: number;
}

export interface SalesPoint {
  date: string;
  total: number;
  orders: number;
}

export interface DashboardStats {
  totalSales: number;
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  salesChart?: SalesPoint[];
  bestSellers?: { product: Product; quantity: number; revenue: number }[];
  recentOrders?: Order[];
}

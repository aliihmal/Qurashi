import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

interface ProductsResponse {
  message: string;
  products?: Product[];
  Products?: Product[];
}

export async function getAllProducts(): Promise<Product[]> {
  const { data } = await api.get<ProductsResponse>("/product/getAllProduct");
  return data.products ?? data.Products ?? [];
}

export async function getProductsOnSale(): Promise<Product[]> {
  const { data } = await api.get<ProductsResponse>("/product/getProdOnSale");
  return data.products ?? data.Products ?? [];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data } = await api.get<ProductsResponse>(
    `/product/GetByCat/${encodeURIComponent(category)}`,
  );
  return data.Products ?? data.products ?? [];
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await api.get<{ product: Product }>(`/product/get/${id}`);
  return data.product;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock?: number;
}

// Backend requires an image file (field name "image") for product creation.
export async function createProduct(payload: ProductPayload, image: File) {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("description", payload.description ?? "");
  form.append("price", String(payload.price));
  form.append("category", payload.category);
  form.append("image", image);

  const { data } = await api.post<{ message: string; id: string; imgSrc: string }>(
    "/product/",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

// TODO: backend has no product-update endpoint yet (only delete + sale discount).
export async function updateProduct(_id: string, _payload: ProductPayload, _image?: File | null) {
  void _id;
  void _payload;
  void _image;
  throw new Error("Product editing is not supported by the backend API yet");
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete<{ message: string }>(`/product/deleteProd/${id}`);
  return data;
}

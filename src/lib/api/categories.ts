import { api } from "@/lib/api";
import type { Collection } from "@/lib/types";

interface CollectionsResponse {
  Message?: string;
  message?: string;
  collections?: Collection[];
}

// "Categories" in the UI map to backend "collections".
export async function getCategories(): Promise<Collection[]> {
  const { data } = await api.get<CollectionsResponse>("/collection/GetAll");
  return data.collections ?? [];
}

// Collection creation requires an image upload (field "image") and auth.
export async function createCategory(name: string, image?: File | null) {
  const form = new FormData();
  form.append("name", name);
  form.append("description", name);
  form.append("price", "0");
  if (image) form.append("image", image);

  const { data } = await api.post<{ message: string }>("/collection/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// TODO: backend has no collection-update endpoint yet.
export async function updateCategory(_id: string, _name: string) {
  void _id;
  void _name;
  throw new Error("Category editing is not supported by the backend API yet");
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete<{ message: string }>(`/collection/delete/${id}`);
  return data;
}

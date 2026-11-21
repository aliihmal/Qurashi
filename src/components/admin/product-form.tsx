"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, type ProductPayload } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  product?: Product;
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    category: product?.category ?? "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories, retry: false });
  const categoryOptions = Array.from(
    new Set([...(categories?.map((c) => c.name) ?? []), ...(form.category ? [form.category] : []), "Perfume", "Jewelry"]),
  );

  const mutation = useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload, image!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price < 0) e.price = "Enter a valid price";
    if (!form.category) e.category = "Category is required";
    if (!isEdit && !image) e.image = "A product image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
    });
  }

  if (isEdit) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <p className="font-serif text-lg">Editing is not supported yet</p>
          <p className="text-sm text-muted">
            The backend API doesn&apos;t expose a product-update endpoint. You can still view
            the product details below.
          </p>
          <dl className="mx-auto mt-4 max-w-sm space-y-1 text-left text-sm">
            <div className="flex justify-between"><dt className="text-muted">Name</dt><dd>{product.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Price</dt><dd>{product.price}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Category</dt><dd>{product.category}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Stock</dt><dd>{product.stock ?? "—"}</dd></div>
          </dl>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={form.name} onChange={set("name")} />
            {errors.name && <p className="text-xs text-clay">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={form.description} onChange={set("description")} />
            {errors.description && <p className="text-xs text-clay">{errors.description}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ($) *</Label>
              <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} />
              {errors.price && <p className="text-xs text-clay">{errors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-clay">{errors.category}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Image *</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            aria-label="Product image"
          />
          {image ? (
            <p className="mt-2 text-xs text-muted">Selected: {image.name}</p>
          ) : (
            errors.image && <p className="mt-2 text-xs text-clay">{errors.image}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

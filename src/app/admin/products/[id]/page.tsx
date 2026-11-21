"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/api/products";
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = use(params);
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="font-serif text-xl">Product not found</p>
          <Link href="/admin/products" className="mt-4 inline-block text-sm text-gold-dark underline">
            Back to products
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Edit product</h1>
        <p className="text-sm text-muted">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}

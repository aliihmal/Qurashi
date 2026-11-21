import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Add product</h1>
        <p className="text-sm text-muted">Create a new product listing</p>
      </div>
      <ProductForm />
    </div>
  );
}

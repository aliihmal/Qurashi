"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getAllProducts, getProductById } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { addItem } from "@/store/cartSlice";
import { ProductCard } from "@/components/storefront/product-card";
import { Reveal } from "@/components/motion/reveal";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProductDetailsPage({ params }: PageProps<"/products/[id]">) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [imgError, setImgError] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    retry: false,
  });
  const { data: allProducts } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getAllProducts,
  });

  const related = (allProducts ?? [])
    .filter((p) => p.id !== id && p.category === product?.category)
    .slice(0, 4);

  const images = product
    ? [product.imgSrc, ...(product.images ?? [])].filter(Boolean) as string[]
    : [];

  const outOfStock =
    product && (product.inStock === false || (product.stock !== undefined && product.stock <= 0));
  const onSale = !!product?.onSale && product.salePrice != null && product.salePrice < product.price;
  const displayPrice = onSale ? product!.salePrice! : (product?.price ?? 0);

  function addToCart() {
    if (!product) return;
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        imgSrc: product.imgSrc,
        quantity,
      }),
    );
    toast.success(`${product.name} added to cart`);
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-3xl">Product not found</h1>
        <p className="mt-2 text-muted">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button variant="gold">Browse all products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
      <Reveal>
        <nav className="mb-10 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <span className="text-border">/</span>
          <Link href="/products" className="transition-colors hover:text-primary">Shop</Link>
          <span className="text-border">/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category ?? "")}`} className="transition-colors hover:text-primary">
            {product.category}
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </Reveal>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Images */}
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
              {images.length > 0 && !imgError ? (
                <motion.div
                  key={images[activeImage]}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                </motion.div>
              ) : (
                <div className="flex h-full items-center justify-center font-serif text-8xl text-primary/25">
                  {product.name.charAt(0)}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border" />
              {outOfStock && (
                <span className="absolute left-5 top-5 bg-background/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                  Out of stock
                </span>
              )}
              {onSale && !outOfStock && (
                <span className="absolute right-5 top-5 bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory">
                  Sale
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => {
                      setActiveImage(i);
                      setImgError(false);
                    }}
                    className={`relative h-20 w-20 overflow-hidden border transition-all duration-300 ${
                      i === activeImage ? "border-primary" : "border-border opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Info */}
        <Reveal delay={0.1}>
          <div>
            <p className="mb-4 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
              <span className="gold-rule w-12" /> {product.category}
            </p>
            <h1 className="font-serif text-4xl font-medium leading-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-5 flex items-baseline gap-4">
              <p className="text-2xl font-medium tracking-wide">{formatPrice(displayPrice)}</p>
              {onSale && (
                <>
                  <p className="text-lg text-text-muted line-through">{formatPrice(product.price)}</p>
                  {product.discountPercent != null && (
                    <Badge variant="danger" className="rounded-none">
                      {product.discountPercent}% off
                    </Badge>
                  )}
                </>
              )}
            </div>

            {product.description && (
              <p className="mt-7 max-w-lg leading-relaxed text-text-secondary">{product.description}</p>
            )}

            <div className="mt-7 space-y-3 border-y border-border py-5 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-text-muted">Availability</span>
                {outOfStock ? (
                  <span className="font-medium text-error">Out of stock</span>
                ) : (
                  <span className="font-medium text-success">
                    In stock{product.stock !== undefined ? ` — ${product.stock} available` : ""}
                  </span>
                )}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex w-fit items-center border border-border">
                <button
                  className="px-4 py-3.5 transition-colors hover:bg-surface-muted disabled:opacity-30"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button
                  className="px-4 py-3.5 transition-colors hover:bg-surface-muted disabled:opacity-30"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={outOfStock || (product.stock !== undefined && quantity >= product.stock)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="gold"
                size="lg"
                onClick={addToCart}
                disabled={!!outOfStock}
                className="flex-1 rounded-none px-10 uppercase tracking-[0.15em] sm:flex-none"
              >
                <ShoppingBag className="h-4 w-4" /> Add to bag
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 border-t border-border pt-8 text-sm text-text-secondary sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} /> Free shipping over $150
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} /> 14-day returns
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} /> Secure checkout
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-28 border-t border-border pt-16">
          <Reveal>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
                  Complete the look
                </p>
                <h2 className="font-serif text-3xl font-medium sm:text-4xl">You may also like</h2>
              </div>
              <Link href={`/products?category=${encodeURIComponent(product.category ?? "")}`} className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-primary sm:block">
                View all →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { addItem } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [imgError, setImgError] = useState(false);
  const outOfStock = product.inStock === false || (product.stock !== undefined && product.stock <= 0);
  const onSale = product.onSale && product.salePrice != null && product.salePrice < product.price;
  const displayPrice = onSale ? product.salePrice! : product.price;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        imgSrc: product.imgSrc,
        quantity: 1,
      }),
    );
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-surface-muted"
        aria-label={product.name}
      >
        {product.imgSrc && !imgError ? (
          <Image
            src={product.imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-5xl text-primary/25">
            {product.name.charAt(0)}
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && !outOfStock && (
            <span className="bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ivory">
              Sale
            </span>
          )}
          {outOfStock && (
            <span className="bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground backdrop-blur-sm">
              Sold out
            </span>
          )}
        </div>

        {/* Quick add — reveals on hover, always visible on touch */}
        {!outOfStock && (
          <motion.div
            initial={false}
            className="absolute inset-x-4 bottom-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <Button
              variant="gold"
              size="sm"
              className="w-full rounded-none uppercase tracking-[0.15em]"
              onClick={quickAdd}
            >
              <Plus className="h-3.5 w-3.5" /> Add to bag
            </Button>
          </motion.div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
          {product.category}
        </p>
        <Link href={`/products/${product.id}`} className="w-fit">
          <h3 className="font-serif text-lg font-medium leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2.5 pt-1">
          <span className="text-sm font-medium tracking-wide">{formatPrice(displayPrice)}</span>
          {onSale && (
            <span className="text-xs text-text-muted line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

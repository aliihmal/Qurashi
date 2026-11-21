"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { updateQuantity, removeItem } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 15;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <ShoppingBag className="h-12 w-12 text-text-muted" strokeWidth={1.25} />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">Your selection</p>
        <h1 className="mt-3 font-serif text-4xl font-medium">Your bag is empty</h1>
        <p className="mt-3 text-sm text-text-muted">Discover something beautiful to add.</p>
        <Link href="/products" className="mt-8">
          <Button variant="gold" className="rounded-none px-10 uppercase tracking-[0.15em]">Start shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-10">
        <div>
          <p className="mb-3 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
            <span className="gold-rule w-12" /> Your bag
          </p>
          <h1 className="font-serif text-4xl font-medium sm:text-5xl">Shopping bag</h1>
        </div>
        <p className="text-sm text-text-muted">
          {items.length} {items.length === 1 ? "piece" : "pieces"}
        </p>
      </div>
      <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-6 py-7">
              <Link
                href={`/products/${item.productId}`}
                className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-surface-muted sm:h-36 sm:w-28"
              >
                {item.imgSrc && !imgErrors[item.productId] ? (
                  <Image
                    src={item.imgSrc}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                    onError={() => setImgErrors((e) => ({ ...e, [item.productId]: true }))}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-2xl text-primary/30">
                    {item.name.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/products/${item.productId}`}
                  className="w-fit font-serif text-xl font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
                <span className="mt-1 text-xs uppercase tracking-[0.15em] text-text-muted">
                  {formatPrice(item.price)} each
                </span>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-border">
                    <button
                      className="px-3 py-2 transition-colors hover:bg-surface-muted disabled:opacity-30"
                      onClick={() =>
                        dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))
                      }
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      className="px-3 py-2 transition-colors hover:bg-surface-muted"
                      onClick={() =>
                        dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      onClick={() => dispatch(removeItem(item.productId))}
                      className="p-1.5 text-text-muted transition-colors hover:text-error"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-border bg-surface p-8 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl font-medium">Order summary</h2>
          <div className="gold-rule my-5 w-16" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Shipping</span>
              <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(subtotal + shipping)}</span>
            </div>
          </div>
          <Link href="/checkout" className="mt-8 block">
            <Button variant="gold" className="w-full rounded-none py-6 uppercase tracking-[0.15em]" size="lg">
              Proceed to checkout
            </Button>
          </Link>
          <Link
            href="/products"
            className="mt-5 block text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-primary"
          >
            Continue shopping
          </Link>
          <p className="mt-6 text-center text-xs text-text-muted">
            {subtotal >= 150
              ? "Complimentary shipping applied"
              : `Add ${formatPrice(150 - subtotal)} for complimentary shipping`}
          </p>
        </aside>
      </div>
    </div>
  );
}

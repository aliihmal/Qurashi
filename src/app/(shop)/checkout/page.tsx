"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { addToBackendCart, createOrder } from "@/lib/api/orders";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { clearCart } from "@/store/cartSlice";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

function CheckoutForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);

  const [notes, setNotes] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 15;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to place an order");
      // Push cart items into the backend cart, collecting cart row ids
      const cartIds = new Set<string>();
      for (const item of items) {
        const ids = await addToBackendCart(user.id, item.productId, item.quantity);
        ids.forEach((id) => cartIds.add(id));
      }
      return createOrder(user.id, [...cartIds]);
    },
    onSuccess: (data) => {
      dispatch(clearCart());
      const orderId = data.order;
      router.push(orderId ? `/checkout/success?order=${orderId}` : "/checkout/success");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    mutation.mutate();
  }

  if (items.length === 0 && !mutation.isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">Nothing to check out</h1>
        <p className="mt-2 text-muted">Your cart is empty.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button variant="gold">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl font-semibold">Checkout</h1>
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Delivery information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-surface-muted/50 p-3 text-sm">
              <p><span className="font-medium">Name:</span> {user?.name}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              {user?.phone && <p><span className="font-medium">Phone:</span> {user.phone}</p>}
              <p className="mt-2 text-xs text-muted">
                Delivery details are stored on your account. The store will contact you
                to confirm delivery.
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-sm font-medium text-ink-soft">
                Order notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions…"
                className="flex min-h-24 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="max-h-56 space-y-2 overflow-auto text-sm">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-2">
                  <span className="truncate text-muted">
                    {i.name} × {i.quantity}
                  </span>
                  <span className="flex-shrink-0">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-ink/10 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? "Placing order…" : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutForm />
    </RequireAuth>
  );
}

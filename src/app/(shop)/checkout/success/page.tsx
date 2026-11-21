"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <CheckCircle2 className="h-16 w-16 text-success" />
      <h1 className="mt-6 font-serif text-4xl">Thank you for your order</h1>
      <p className="mt-3 text-muted">
        Your order has been placed successfully.
        {orderId && (
          <>
            {" "}Order reference:{" "}
            <span className="font-medium text-ink">#{orderId.slice(-8).toUpperCase()}</span>
          </>
        )}
      </p>
      <p className="mt-2 text-sm text-muted">
        We&apos;ll contact you to confirm delivery details. Track your order anytime in your account.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {orderId && (
          <Link href={`/orders/${orderId}`}>
            <Button variant="outline">Track order</Button>
          </Link>
        )}
        <Link href="/products">
          <Button variant="gold">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}

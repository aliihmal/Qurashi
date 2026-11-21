"use client";

import Link from "next/link";
import { AtSign, Globe, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-surface text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-serif text-5xl font-medium tracking-[0.15em] text-ivory">QURASHI</p>
          <div className="gold-rule mt-4 w-24" />
          <p className="mt-3 text-sm leading-relaxed text-ivory/60">
            Curated fine perfumes and timeless jewelry, delivered to your door.
          </p>
          <div className="mt-4 flex gap-3">
            {[AtSign, Globe, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="rounded-full p-2 text-ivory/60 hover:bg-foreground/10 hover:text-ivory"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-light">Shop</p>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/products?category=Perfume" className="hover:text-ivory">Men&apos;s Perfumes</Link></li>
            <li><Link href="/products?category=Perfume" className="hover:text-ivory">Women&apos;s Perfumes</Link></li>
            <li><Link href="/products?category=Jewelry" className="hover:text-ivory">Rings</Link></li>
            <li><Link href="/products?category=Jewelry" className="hover:text-ivory">Necklaces</Link></li>
            <li><Link href="/products?category=Jewelry" className="hover:text-ivory">Bracelets & Watches</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-light">Account</p>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/login" className="hover:text-ivory">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-ivory">Create account</Link></li>
            <li><Link href="/account" className="hover:text-ivory">My account</Link></li>
            <li><Link href="/account/orders" className="hover:text-ivory">Order history</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-light">Help</p>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/cart" className="hover:text-ivory">Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-ivory">Checkout</Link></li>
            <li><Link href="/account/orders" className="hover:text-ivory">Track order</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Qurashi. All rights reserved.
      </div>
    </footer>
  );
}

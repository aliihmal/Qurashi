"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { logout as logoutApi, storeUser } from "@/lib/api/auth";
import { logout } from "@/store/authSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop All" },
  { href: "/products?category=Perfume", label: "Perfumes" },
  { href: "/products?category=Jewelry", label: "Jewelry" },
];

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "ROLE.admin";

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      storeUser(null);
      dispatch(logout());
      router.push("/");
      router.refresh();
    }
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      {/* Announcement bar */}
      <div className="bg-primary px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-background">
        Complimentary shipping on orders over $150
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          className="rounded-md p-2 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="font-serif text-[26px] font-medium tracking-[0.08em]">
          QURASHI
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-none px-3 py-2 text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary transition-colors hover:bg-transparent hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden w-64 md:block lg:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pieces…"
              className="h-9 w-full rounded-none border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none"
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            href="/cart"
            className="relative rounded-none p-2.5 transition-colors hover:bg-surface-muted"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-bold text-background">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block text-xs font-normal text-muted">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/account/orders")}>
                  Order History
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="rounded-none p-2.5 transition-colors hover:bg-surface-muted"
              aria-label="Sign in"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-5 py-5 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pieces…"
                className="h-11 w-full rounded-none border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </form>
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border/60 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-text-secondary transition-colors last:border-0 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

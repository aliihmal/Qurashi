"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchX, Search } from "lucide-react";
import { getAllProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/storefront/product-card";
import { Reveal, Stagger, staggerItem } from "@/components/motion/reveal";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const initialQuery = searchParams.get("q") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("featured");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getAllProducts,
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories, retry: false });

  const allCategories = useMemo(() => {
    const names = (
      categories && categories.length
        ? categories.map((c) => c.name)
        : Array.from(new Set((products ?? []).map((p) => p.category).filter((c): c is string => !!c)))
    ).filter((c): c is string => !!c);
    return ["all", ...names];
  }, [categories, products]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (category !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, category, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-10">
          <div>
            <p className="mb-3 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
              <span className="gold-rule w-12" /> The Collection
            </p>
            <h1 className="font-serif text-4xl font-medium sm:text-5xl">
              {category === "all" ? "All pieces" : category}
            </h1>
          </div>
          <p className="text-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            {query.trim() && (
              <>
                {" "}matching &ldquo;{query.trim()}&rdquo;
              </>
            )}
          </p>
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={0.1}>
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-none border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                  category === cat
                    ? "border-primary bg-primary text-background"
                    : "border-border bg-transparent text-text-secondary hover:border-primary/60 hover:text-primary"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
          <div className="flex gap-3 lg:ml-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pieces…"
                className="h-11 w-full rounded-none border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
                aria-label="Search products"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-44 rounded-none" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-none" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-28 text-center">
          <SearchX className="h-10 w-10 text-text-muted" strokeWidth={1.5} />
          <p className="font-serif text-2xl">Nothing found</p>
          <p className="text-sm text-text-muted">Try a different search or category.</p>
          <button
            onClick={() => {
              setCategory("all");
              setQuery("");
            }}
            className="mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary underline underline-offset-8 transition-colors hover:text-secondary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
          {filtered.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </Stagger>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 sm:px-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-none" />
          ))}
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}

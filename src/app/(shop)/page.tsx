"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getAllProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const FALLBACK_COLLECTIONS = [
  { name: "Perfume", note: "Eau de parfum, extrait" },
  { name: "Jewelry", note: "Fine jewelry" },
  { name: "Rings", note: "Signature pieces" },
  { name: "Necklaces", note: "Chains & pendants" },
];

const ASSETS = "/assets/brand";

/** Letter-by-letter logo reveal — letters rise from behind a mask */
function LogoReveal() {
  const reduce = useReducedMotion();
  const letters = "QURASHI".split("");
  return (
    <h1
      className="font-serif text-[clamp(3rem,12vw,9rem)] font-medium leading-[0.9] tracking-[0.04em]"
      aria-label="Qurashi"
    >
      {letters.map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, delay: 0.5 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

export default function HomePage() {
  const reduce = useReducedMotion();
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: getAllProducts });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories, retry: false });

  const names =
    categories && categories.length
      ? categories.map((c) => c.name).filter((n): n is string => !!n)
      : Array.from(new Set((products ?? []).map((p) => p.category).filter((c): c is string => !!c)));

  const collections = (names.length ? names : FALLBACK_COLLECTIONS.map((c) => c.name)).map((name, i) => ({
    name,
    note: FALLBACK_COLLECTIONS.find((f) => f.name.toLowerCase() === name.toLowerCase())?.note ?? "Discover the edit",
    index: i + 1,
  }));

  const pieceCount = products?.length ?? 0;

  return (
    <div className="bg-background">
      {/* ================= CINEMATIC HERO ================= */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
        {/* Photography backdrop — slow cinematic drift */}
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={`${ASSETS}/hero.jpg`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        {/* Mood overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/45 to-background" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(9,9,9,0.55)_100%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy/30 to-transparent" aria-hidden />

        {/* Hairline frame */}
        <div className="pointer-events-none absolute inset-4 border border-ivory/15 sm:inset-6" aria-hidden />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8 text-[11px] font-semibold uppercase tracking-[0.5em] text-secondary"
          >
            Maison de Parfum &amp; Joaillerie
          </motion.p>

          {/* Giant wordmark — letters rise from behind their mask */}
          <LogoReveal />

          <motion.div
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.3, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="gold-rule mx-auto mt-9 w-44 origin-center"
          />

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg"
          >
            Rare fragrances and fine jewelry, gathered under one name —
            for those who believe beauty should be felt, not announced.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.55 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
          >
            <Link href="/products">
              <Button
                variant="gold"
                size="lg"
                className="rounded-none border border-primary bg-primary/90 px-12 backdrop-blur-sm hover:bg-primary"
              >
                Enter the maison <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="#collections"
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-ivory/80 transition-colors hover:text-secondary"
            >
              The collections
              <span className="inline-block transition-transform duration-300 group-hover:translate-y-1">↓</span>
            </Link>
          </motion.div>
        </div>

        {/* Bottom meta */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute inset-x-0 bottom-8 flex items-center justify-between px-10 text-[10px] uppercase tracking-[0.3em] text-ivory/50"
        >
          <span>Est. collection</span>
          <span className="hidden sm:block">{pieceCount > 0 ? `${pieceCount} pieces` : "Curated pieces"}</span>
          <span>Scroll</span>
        </motion.div>
      </section>

      {/* ================= COLLECTION INDEX ================= */}
      <section id="collections" className="mx-auto max-w-7xl px-6 py-28 sm:px-10">
        <Reveal>
          <div className="mb-16 flex items-end justify-between border-b border-border pb-8">
            <div>
              <p className="mb-3 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-primary">
                <span className="gold-rule w-12" /> Collections
              </p>
              <h2 className="font-serif text-4xl font-medium sm:text-5xl">The worlds of Qurashi</h2>
            </div>
            <Link
              href="/products"
              className="group hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-text-secondary transition-colors hover:text-primary sm:flex"
            >
              View all <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="border-t border-border">
          {collections.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <Link
                href={`/products?category=${encodeURIComponent(c.name)}`}
                className="group relative flex items-baseline gap-6 overflow-hidden border-b border-border px-2 py-9 transition-colors duration-500 hover:bg-surface/60 sm:gap-12 sm:px-6"
              >
                <span className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-500 group-hover:scale-y-100" />
                <span className="font-serif text-sm italic text-text-muted transition-colors group-hover:text-primary">
                  {String(c.index).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-3xl font-medium transition-all duration-500 group-hover:translate-x-3 group-hover:text-primary sm:text-5xl">
                  {c.name}
                </h3>
                <span className="ml-auto hidden text-[11px] uppercase tracking-[0.25em] text-text-muted transition-colors group-hover:text-secondary md:block">
                  {c.note}
                </span>
                <ArrowUpRight className="h-6 w-6 shrink-0 text-text-muted transition-all duration-500 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= EDITORIAL COLLAGE ================= */}
      <section className="mx-auto max-w-7xl px-6 pb-28 sm:px-10">
        <div className="grid gap-6 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <Link href="/products?category=Jewelry" className="group relative block aspect-[4/5] overflow-hidden">
              <Image
                src={`${ASSETS}/jewelry-1.jpg`}
                alt="Fine jewelry from the Qurashi collection"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-secondary">The edit</p>
                <p className="mt-2 font-serif text-3xl text-ivory">Fine jewelry</p>
              </div>
            </Link>
          </Reveal>
          <div className="flex flex-col gap-6 md:col-span-5">
            <Reveal delay={0.15}>
              <Link href="/products?category=Perfume" className="group relative block aspect-[4/3] overflow-hidden">
                <Image
                  src={`${ASSETS}/perfume-1.jpg`}
                  alt="Signature perfume"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-secondary">Nose first</p>
                  <p className="mt-2 font-serif text-3xl text-ivory">Parfum</p>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={0.25}>
              <Link href="/products?category=Necklaces" className="group relative block aspect-[4/3] flex-1 overflow-hidden">
                <Image
                  src={`${ASSETS}/necklace-1.jpg`}
                  alt="Necklace detail"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-secondary">Around the neck</p>
                  <p className="mt-2 font-serif text-3xl text-ivory">Necklaces</p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= THE FOUNDERS — BURGUNDY ================= */}
      <section className="relative overflow-hidden bg-[#2a0f11] py-32 text-ivory">
        {/* Layered burgundy depth + blended gold light */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#2a0f11] to-background" aria-hidden />
        <div className="blend-b pointer-events-none absolute left-[15%] top-[-20%] h-[55vmin] w-[55vmin] rounded-full bg-primary/[0.10] blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute bottom-[-30%] right-[10%] h-[45vmin] w-[45vmin] rounded-full bg-accent/60 blur-[100px]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,9,0.5)_100%)]" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-10">
          <Reveal>
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.5em] text-secondary">
              Fondé par
            </p>
            <div className="gold-rule mx-auto mb-12 w-28" />

            <div className="grid gap-12 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="font-serif text-4xl font-medium italic leading-tight text-ivory sm:text-5xl">
                  Abdulsamad
                </p>
                <p className="mt-2 font-serif text-4xl font-medium leading-tight text-ivory sm:text-5xl">
                  Al Quraishi
                </p>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary/80">
                  Vision &amp; Direction
                </p>
              </div>
              <div className="sm:border-l sm:border-ivory/15 sm:pl-8">
                <p className="font-serif text-4xl font-medium italic leading-tight text-ivory sm:text-5xl">
                  Sami
                </p>
                <p className="mt-2 font-serif text-4xl font-medium leading-tight text-ivory sm:text-5xl">
                  Al Quraishi
                </p>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary/80">
                  Craft &amp; Curation
                </p>
              </div>
            </div>

            <p className="mx-auto mt-14 max-w-xl font-serif text-lg italic leading-relaxed text-ivory/60 sm:text-xl">
              “Two names, one standard — everything we release must deserve
              to be kept.”
            </p>
            <div className="gold-rule mx-auto mt-10 w-24" />
            <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-ivory/40">
              The House of Qurashi
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= CRAFT — SPLIT WITH IMAGE ================= */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-28 sm:px-10 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <div className="lg:sticky lg:top-32">
            <p className="mb-3 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-primary">
              <span className="gold-rule w-12" /> Savoir-faire
            </p>
            <h2 className="font-serif text-4xl font-medium leading-tight sm:text-5xl">
              The quiet
              <br />
              <span className="italic text-secondary">craft</span> of selection
            </h2>
            <div className="gold-rule mt-8 w-24" />
            <Link
              href="/products"
              className="group mt-10 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground"
            >
              <span className="border-b border-border pb-1 transition-colors group-hover:border-primary group-hover:text-primary">
                Discover the collection
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="space-y-10">
          {[
            {
              n: "I",
              t: "Selection over volume",
              d: "Every fragrance and every piece of jewelry in the collection is chosen for its material honesty and staying power — not for its season.",
            },
            {
              n: "II",
              t: "Fragrance as signature",
              d: "Our perfume edit spans warm florals, deep ouds, and luminous musks — scents composed to be worn close, remembered long.",
            },
            {
              n: "III",
              t: "Jewelry that outlives",
              d: "Rings, necklaces, and bracelets in gold and fine materials, designed to be inherited rather than replaced.",
            },
          ].map((b, i) => (
            <Reveal key={b.n} delay={i * 0.12}>
              <div className="group border-l border-border pl-8 transition-colors duration-500 hover:border-primary">
                <p className="font-serif text-sm italic text-primary">{b.n}.</p>
                <h3 className="mt-2 font-serif text-2xl font-medium transition-colors group-hover:text-primary">
                  {b.t}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-text-secondary">{b.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= SIGNATURE BAND — PHOTOGRAPHY + BURGUNDY ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`${ASSETS}/detail-1.jpg`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a1214]/95 via-accent/80 to-[#1c0d0f]/70" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-32 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <Reveal>
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.45em] text-secondary">
              The Signature Edit
            </p>
            <h2 className="font-serif text-4xl font-medium leading-tight sm:text-6xl">
              Pieces chosen
              <br />
              <span className="italic text-secondary">once</span>,
              <br />
              worn forever
            </h2>
            <div className="gold-rule mt-10 w-32" />
            <p className="mt-8 max-w-md leading-relaxed text-ivory/70">
              A private selection of our most distinctive creations — the objects
              our clients return for, season after season.
            </p>
            <Link href="/products" className="mt-12 inline-block">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none border-ivory/40 px-12 uppercase tracking-[0.2em] text-ivory hover:border-primary hover:bg-primary hover:text-background"
              >
                Explore the edit <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="relative ml-auto aspect-[3/4] w-full max-w-sm overflow-hidden border border-ivory/20">
              <Image
                src={`${ASSETS}/ring-1.jpg`}
                alt="Signature ring"
                fill
                sizes="(max-width: 1024px) 80vw, 30vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FINAL INVITATION ================= */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0">
          <Image
            src={`${ASSETS}/perfume-2.jpg`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" aria-hidden />
        <div className="pointer-events-none absolute inset-4 border border-border/60" aria-hidden />
        <div className="blend-a pointer-events-none absolute left-[20%] top-[20%] h-[50vmin] w-[50vmin] rounded-full bg-primary/[0.08] blur-[100px]" aria-hidden />
        <Reveal className="relative">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.45em] text-primary">
            Begin your collection
          </p>
          <h2 className="font-serif text-4xl font-medium leading-tight sm:text-6xl">
            Some things are
            <br />
            <span className="italic text-secondary">worth the wait</span>
          </h2>
          <Link href="/products" className="mt-12 inline-block">
            <Button variant="gold" size="lg" className="rounded-none px-14">
              Shop Qurashi
            </Button>
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

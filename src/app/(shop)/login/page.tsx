"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { login, storeUser } from "@/lib/api/auth";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      storeUser(data.user);
      dispatch(setUser(data.user));
      toast.success("Welcome back!");
      const isAdmin = data.user.role === "admin" || data.user.role === "ROLE.admin";
      router.push(isAdmin ? "/admin" : "/account");
      router.refresh();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Login failed");
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ email: email.trim(), password });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-0 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:py-24">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-14 lg:flex">
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-secondary">
          The House of Qurashi
        </p>
        <div>
          <h2 className="font-serif text-5xl font-medium leading-tight text-ivory">
            Beauty,
            <br />
            <span className="italic text-secondary">considered</span>
          </h2>
          <div className="gold-rule mt-8 w-24" />
          <p className="mt-8 max-w-xs leading-relaxed text-ivory/60">
            Sign in to your account to revisit your selections and follow your orders.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/40">
          Fine jewelry & fragrance
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center border border-border bg-surface px-8 py-14 lg:border-l-0">
        <div className="w-full max-w-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">Welcome</p>
          <h1 className="font-serif text-4xl font-medium">Sign in</h1>
          <Card className="mt-8 rounded-none border-0 bg-transparent shadow-none">
            <CardContent className="p-0">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    className="h-12 rounded-none border-border bg-background"
                  />
                  {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    className="h-12 rounded-none border-border bg-background"
                  />
                  {errors.password && <p className="text-xs text-error">{errors.password}</p>}
                </div>
                <Button type="submit" variant="gold" className="h-12 w-full rounded-none uppercase tracking-[0.15em]" disabled={mutation.isPending}>
                  {mutation.isPending ? "Signing in…" : "Sign in"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-text-muted">
                New to Qurashi?{" "}
                <Link href="/register" className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-secondary">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

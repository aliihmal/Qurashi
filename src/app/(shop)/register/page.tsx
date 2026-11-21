"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { signUp, login, storeUser } from "@/lib/api/auth";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() });
      // Auto-login after successful registration
      return login({ email: form.email.trim(), password: form.password });
    },
    onSuccess: (data) => {
      storeUser(data.user);
      dispatch(setUser(data.user));
      toast.success("Account created — welcome!");
      router.push("/account");
      router.refresh();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    },
  });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
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
            Become part
            <br />
            of the <span className="italic text-secondary">house</span>
          </h2>
          <div className="gold-rule mt-8 w-24" />
          <p className="mt-8 max-w-xs leading-relaxed text-ivory/60">
            Create your account to save your selections and enjoy a more personal experience.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/40">
          Fine jewelry & fragrance
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center border border-border bg-surface px-8 py-14 lg:border-l-0">
        <div className="w-full max-w-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">Join us</p>
          <h1 className="font-serif text-4xl font-medium">Create account</h1>
          <Card className="mt-8 rounded-none border-0 bg-transparent shadow-none">
            <CardContent className="p-0">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {(
                  [
                    ["name", "Full name", "text", "name"],
                    ["email", "Email", "email", "email"],
                    ["phone", "Phone number", "tel", "tel"],
                    ["password", "Password", "password", "new-password"],
                    ["confirm", "Confirm password", "password", "new-password"],
                  ] as const
                ).map(([field, label, type, auto]) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={field} className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">{label}</Label>
                    <Input
                      id={field}
                      type={type}
                      autoComplete={auto}
                      value={form[field]}
                      onChange={set(field)}
                      aria-invalid={!!errors[field]}
                      className="h-12 rounded-none border-border bg-background"
                    />
                    {errors[field] && <p className="text-xs text-error">{errors[field]}</p>}
                  </div>
                ))}
                <Button type="submit" variant="gold" className="h-12 w-full rounded-none uppercase tracking-[0.15em]" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating account…" : "Create account"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-text-muted">
                Already a member?{" "}
                <Link href="/login" className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-secondary">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

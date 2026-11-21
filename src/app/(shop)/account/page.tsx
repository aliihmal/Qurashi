"use client";

import Link from "next/link";
import { Package, User as UserIcon, Phone, Mail } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="mb-8 font-serif text-3xl font-semibold">My Account</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-gold-dark" /> Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Name:</span> {user?.name}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted" /> {user?.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted" /> {user?.phone ?? "—"}
              </p>
              <p>
                <span className="font-medium">Role:</span> {user?.role}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-gold-dark" /> Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted">View your order history and track deliveries.</p>
              <Link href="/account/orders">
                <Button variant="outline" size="sm">
                  View orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}

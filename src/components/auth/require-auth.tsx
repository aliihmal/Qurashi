"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const router = useRouter();
  const { user, initialized } = useAppSelector((s) => s.auth);

  const isAdmin = user?.role === "admin" || user?.role === "ROLE.admin";

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace("/login");
    } else if (admin && !isAdmin) {
      router.replace("/");
    }
  }, [initialized, user, isAdmin, admin, router]);

  if (!initialized || !user || (admin && !isAdmin)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}

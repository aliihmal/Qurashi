"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store } from "@/store";
import { getMe } from "@/lib/api/auth";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    getMe()
      .then((user) => dispatch(setUser(user)))
      .catch(() => dispatch(setUser(null)));
  }, [dispatch]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionBootstrap />
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </Provider>
  );
}

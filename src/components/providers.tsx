"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { StoreProvider } from "@/lib/store";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/search/search-overlay";
import { GlowCursor } from "@/components/atmosphere/ambient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <SmoothScroll />
        <GlowCursor />
        {children}
        <CartDrawer />
        <SearchOverlay />
        <Toaster
          position="bottom-center"
          gutter={10}
          toastOptions={{
            duration: 2800,
            style: {
              background: "rgba(255, 251, 249, 0.92)",
              backdropFilter: "blur(18px)",
              color: "#4a4145",
              border: "1px solid rgba(248, 182, 200, 0.5)",
              borderRadius: "999px",
              padding: "0.7rem 1.15rem",
              fontSize: "0.9rem",
              boxShadow: "0 20px 45px -22px rgba(190, 136, 156, 0.5)",
            },
            success: { iconTheme: { primary: "#F8B6C8", secondary: "#FFF7F4" } },
          }}
        />
      </StoreProvider>
    </QueryClientProvider>
  );
}

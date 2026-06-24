"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function SonnerToaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      richColors
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-1)",
          border: "1px solid var(--border-clr)",
          color: "var(--text)",
        },
      }}
    />
  );
}

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Campus Lost & Found",
    template: "%s | Campus L&F",
  },
  description:
    "A dedicated portal for posting and finding lost items on campus. Search by category, location, and more.",
  keywords: ["lost and found", "campus", "student", "items", "university"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100dvh-4rem)]">
            {children}
          </main>
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}

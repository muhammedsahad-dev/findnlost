"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, MapPin, Plus, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Only create the Supabase client on the browser (env vars may be absent at build time)
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      const role =
        (data.user?.app_metadata as Record<string, string>)?.role ||
        (data.user?.user_metadata as Record<string, string>)?.role;
      setIsAdmin(role === "admin");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      const role =
        (session?.user?.app_metadata as Record<string, string>)?.role ||
        (session?.user?.user_metadata as Record<string, string>)?.role;
      setIsAdmin(role === "admin");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };


  const navLinks = [
    { href: "/", label: "Browse Items" },
    { href: "/post/lost", label: "Report Lost" },
    { href: "/post/found", label: "Report Found" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-clr)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-emerald-500 shadow-sm">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-[var(--text)]">
              Campus<span className="text-amber-500">L&F</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    pathname === link.href
                      ? "bg-[var(--bg-2)] text-[var(--text)]"
                      : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--bg-1)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors duration-150",
                    pathname.startsWith("/admin")
                      ? "bg-[var(--bg-2)] text-[var(--text)]"
                      : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--bg-1)]"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              id="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
            </Button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-[var(--text-3)] max-w-[140px] truncate">
                  {user.email}
                </span>
                <Button variant="ghost" size="icon-sm" onClick={handleLogout} id="logout-btn" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    <Plus className="h-3.5 w-3.5" />
                    Register
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border-clr)] py-3 space-y-1 animate-slide-up">
            {user && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[var(--bg-2)] text-[var(--text)]"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--bg-1)]"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--bg-1)]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
            <div className="pt-2 border-t border-[var(--border-clr)]">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-[var(--text-3)] truncate max-w-[200px]">{user.email}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

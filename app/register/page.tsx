"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterValues } from "@/lib/validations/item.schema";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const domainRestriction = process.env.NEXT_PUBLIC_DOMAIN_RESTRICTION;

  const schema = domainRestriction
    ? registerSchema.refine(
        (data) => data.email.endsWith(`@${domainRestriction}`),
        { message: `Email must be a @${domainRestriction} address`, path: ["email"] }
      )
    : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: RegisterValues) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text)] mb-2">Check your email</h1>
          <p className="text-sm text-[var(--text-2)]">
            We&apos;ve sent you a confirmation link. Click it to activate your account.
          </p>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => router.push("/login")}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 shadow-lg mb-4">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text)]">Create account</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            Join the campus lost &amp; found community
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-clr)] bg-[var(--bg)] p-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder={domainRestriction ? `you@${domainRestriction}` : "you@example.com"}
                {...register("email")}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  {...register("password")}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading} id="register-submit-btn">
              {isLoading ? "Creating account…" : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-3)] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

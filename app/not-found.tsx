import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-2)] mx-auto mb-6">
          <PackageX className="h-8 w-8 text-[var(--text-3)]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--text)] mb-2">
          Item Not Found
        </h1>
        <p className="text-[var(--text-2)] mb-6">
          This item may have been removed or doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/">Browse All Items</Link>
        </Button>
      </div>
    </div>
  );
}

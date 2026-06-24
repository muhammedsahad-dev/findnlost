import type { Metadata } from "next";
import { ItemForm } from "@/components/ItemForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Report Lost Item",
  description: "Post a lost item to the campus lost and found portal.",
};

export default function PostLostPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-sm font-medium text-amber-800 dark:text-amber-300 mb-3">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Lost Item
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text)]">
          Report a Lost Item
        </h1>
        <p className="text-[var(--text-2)] mt-1.5 text-sm">
          Fill in the details below. Use the AI button to generate a description automatically.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border-clr)] bg-[var(--bg)] p-6 shadow-[var(--shadow-card)]">
        <ItemForm type="lost" />
      </div>
    </div>
  );
}

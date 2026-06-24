"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPin, Calendar, Tag, Phone, Share2, CheckCircle, ArrowLeft, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { formatDate, timeAgo } from "@/lib/utils";
import type { Item } from "@/types";

interface ItemDetailClientProps {
  item: Item;
  currentUserId: string | null;
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "ID Card / Student Card": "🪪", "Keys": "🔑", "Electronics": "💻",
    "Books / Notes": "📚", "Bag / Backpack": "🎒", "Clothing": "👕",
    "Drinkware": "🍶", "Stationery": "✏️", "Jewellery / Accessories": "💍",
    "Wallet / Purse": "👜", "Sports Equipment": "⚽", "Other": "📦",
  };
  return map[category] ?? "📦";
}

export function ItemDetailClient({ item: initialItem, currentUserId }: ItemDetailClientProps) {
  const [item, setItem] = useState(initialItem);
  const [claimDialog, setClaimDialog] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const isOwner = currentUserId === item.posted_by;
  const canClaim = isOwner && item.status === "open";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to mark as claimed");
      }
      const { item: updated } = await res.json();
      setItem(updated);
      toast.success("Item marked as claimed!");
      setClaimDialog(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <article className="rounded-xl border border-[var(--border-clr)] bg-[var(--bg)] overflow-hidden shadow-[var(--shadow-card)]">
        {/* Image */}
        {item.image_url ? (
          <div className="relative h-64 sm:h-80 w-full bg-[var(--bg-2)]">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center bg-[var(--bg-2)] text-6xl">
            {getCategoryEmoji(item.category)}
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant={item.type === "lost" ? "lost" : "found"}>
                  {item.type === "lost" ? "Lost" : "Found"}
                </Badge>
                <Badge variant={item.status === "claimed" ? "claimed" : "open"}>
                  {item.status === "claimed" ? "✓ Claimed" : "Open"}
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-bold text-[var(--text)] leading-tight">
                {item.title}
              </h1>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                id="share-btn"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">Description</h2>
            <p className="text-[var(--text)] text-sm leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          <Separator />

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-2)]">
                <Tag className="h-4 w-4 text-[var(--text-3)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-3)]">Category</p>
                <p className="text-sm font-medium text-[var(--text)]">{item.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-2)]">
                <MapPin className="h-4 w-4 text-[var(--text-3)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-3)]">Location</p>
                <p className="text-sm font-medium text-[var(--text)]">{item.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-2)]">
                <Calendar className="h-4 w-4 text-[var(--text-3)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-3)]">{item.type === "lost" ? "Date Lost" : "Date Found"}</p>
                <p className="text-sm font-medium text-[var(--text)]">{formatDate(item.date_occurred)}</p>
              </div>
            </div>

            {item.storage_location && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-2)]">
                  <Info className="h-4 w-4 text-[var(--text-3)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-3)]">Item is kept at</p>
                  <p className="text-sm font-medium text-[var(--text)]">{item.storage_location}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="rounded-lg bg-[var(--bg-1)] border border-[var(--border-clr)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-[var(--text-3)]" />
              <h2 className="text-sm font-semibold text-[var(--text)]">Contact Info</h2>
            </div>
            {currentUserId ? (
              <p className="text-sm text-[var(--text-2)]">{item.contact_info}</p>
            ) : (
              <p className="text-sm text-[var(--text-3)]">
                <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline">
                  Sign in
                </Link>{" "}
                to view contact information.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[var(--text-3)]">
              Posted {timeAgo(item.created_at)}
            </p>

            {item.status === "claimed" ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">This item has been claimed</span>
              </div>
            ) : canClaim ? (
              <Button
                variant="emerald"
                onClick={() => setClaimDialog(true)}
                id="claim-btn"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Claimed
              </Button>
            ) : null}
          </div>
        </div>
      </article>

      {/* Claim Confirmation Dialog */}
      <Dialog open={claimDialog} onOpenChange={setClaimDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Claimed?</DialogTitle>
            <DialogDescription>
              This will mark &ldquo;{item.title}&rdquo; as claimed and update its status on the public feed.
              This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isClaiming}>Cancel</Button>
            </DialogClose>
            <Button
              variant="emerald"
              onClick={handleClaim}
              isLoading={isClaiming}
              id="confirm-claim-btn"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Claimed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

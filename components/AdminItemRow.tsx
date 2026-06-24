"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate, timeAgo } from "@/lib/utils";
import type { Item } from "@/types";
import Link from "next/link";

interface AdminItemRowProps {
  item: Item;
  posterEmail?: string;
  onStatusChange: (id: string, status: Item["status"]) => void;
}

export function AdminItemRow({ item, posterEmail, onStatusChange }: AdminItemRowProps) {
  const [dialogAction, setDialogAction] = useState<"remove" | "restore" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!dialogAction) return;
    setIsLoading(true);
    try {
      const newStatus = dialogAction === "remove" ? "removed" : "open";
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
      onStatusChange(item.id, newStatus);
      toast.success(
        dialogAction === "remove"
          ? "Item removed from public feed"
          : "Item restored to public feed"
      );
      setDialogAction(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <tr className="border-b border-[var(--border-clr)] hover:bg-[var(--bg-1)] transition-colors">
        {/* Title */}
        <td className="px-4 py-3 max-w-[200px]">
          <div className="flex items-center gap-2">
            <Link
              href={`/items/${item.id}`}
              target="_blank"
              className="font-medium text-sm text-[var(--text)] hover:text-amber-600 dark:hover:text-amber-400 truncate transition-colors"
            >
              {item.title}
            </Link>
            <ExternalLink className="h-3 w-3 text-[var(--text-3)] shrink-0" />
          </div>
          <p className="text-xs text-[var(--text-3)] truncate mt-0.5">{item.category}</p>
        </td>

        {/* Type */}
        <td className="px-4 py-3">
          <Badge variant={item.type === "lost" ? "lost" : "found"}>
            {item.type}
          </Badge>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <Badge
            variant={
              item.status === "open"
                ? "open"
                : item.status === "claimed"
                ? "claimed"
                : "removed"
            }
          >
            {item.status}
          </Badge>
        </td>

        {/* Poster */}
        <td className="px-4 py-3 max-w-[160px]">
          <p className="text-xs text-[var(--text-2)] truncate">
            {posterEmail ?? item.posted_by ?? "—"}
          </p>
        </td>

        {/* Date */}
        <td className="px-4 py-3 whitespace-nowrap">
          <p className="text-xs text-[var(--text-2)]">{formatDate(item.created_at)}</p>
          <p className="text-xs text-[var(--text-3)]">{timeAgo(item.created_at)}</p>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {item.status !== "removed" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogAction("remove")}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                id={`remove-item-${item.id}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogAction("restore")}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs"
                id={`restore-item-${item.id}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Confirmation dialog */}
      <Dialog open={dialogAction !== null} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "remove" ? "Remove this post?" : "Restore this post?"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "remove"
                ? `"${item.title}" will be hidden from the public feed but remain in the admin dashboard.`
                : `"${item.title}" will be restored and visible on the public feed.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button
              variant={dialogAction === "remove" ? "destructive" : "emerald"}
              onClick={handleConfirm}
              isLoading={isLoading}
              id={`confirm-${dialogAction}-btn`}
            >
              {dialogAction === "remove" ? "Remove" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

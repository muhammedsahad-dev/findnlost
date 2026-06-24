import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Tag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import type { Item } from "@/types";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group block"
      aria-label={`View item: ${item.title}`}
    >
      <article
        className={cn(
          "relative flex flex-col rounded-xl overflow-hidden border border-[var(--border-clr)] bg-[var(--bg)] h-full",
          "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
          "transition-all duration-300 hover:-translate-y-1"
        )}
      >
        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden bg-[var(--bg-2)] shrink-0">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-5xl opacity-30 select-none">
                {getCategoryEmoji(item.category)}
              </div>
            </div>
          )}

          {/* Type + Status badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <Badge variant={item.type === "lost" ? "lost" : "found"}>
              {item.type === "lost" ? "Lost" : "Found"}
            </Badge>
            {item.status === "claimed" && (
              <Badge variant="claimed">✓ Claimed</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <h3 className="font-semibold text-[var(--text)] text-base leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-[var(--text-3)] line-clamp-2 flex-1">
            {item.description}
          </p>

          <div className="mt-auto pt-2 border-t border-[var(--border-clr)] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
              <Tag className="h-3 w-3 shrink-0 text-[var(--text-3)]" />
              <span className="truncate">{item.category}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
              <MapPin className="h-3 w-3 shrink-0 text-[var(--text-3)]" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
              <Calendar className="h-3 w-3 shrink-0 text-[var(--text-3)]" />
              <span>{formatDate(item.date_occurred)}</span>
              <span className="ml-auto text-[var(--text-3)]">{timeAgo(item.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Hover arrow */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <ArrowRight className="h-4 w-4 text-[var(--text-3)]" />
        </div>
      </article>
    </Link>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "ID Card / Student Card": "🪪",
    "Keys": "🔑",
    "Electronics": "💻",
    "Books / Notes": "📚",
    "Bag / Backpack": "🎒",
    "Clothing": "👕",
    "Drinkware": "🍶",
    "Stationery": "✏️",
    "Jewellery / Accessories": "💍",
    "Wallet / Purse": "👜",
    "Sports Equipment": "⚽",
    "Other": "📦",
  };
  return map[category] ?? "📦";
}

"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel, defaultFilters, type FilterState } from "@/components/FilterPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { buildSearchParams } from "@/lib/utils";
import type { Item, ItemsResponse } from "@/types";
import { PackageOpen, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

async function fetchItems(params: Record<string, string | number | undefined>): Promise<ItemsResponse> {
  const qs = buildSearchParams(params);
  const res = await fetch(`/api/items?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export default function HomePage() {
  const [tab, setTab] = useState<"" | "lost" | "found">("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(1);

  const queryParams = {
    type: tab || undefined,
    category: filters.category || undefined,
    location: filters.location || undefined,
    status: filters.status || undefined,
    search: search || undefined,
    page,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", queryParams],
    queryFn: () => fetchItems(queryParams),
  });

  const handleTabChange = useCallback((val: string) => {
    setTab(val === "all" ? "" : (val as "lost" | "found"));
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, []);

  const items: Item[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-2">
          Campus Lost &amp; Found
        </h1>
        <p className="text-[var(--text-2)] text-base sm:text-lg max-w-xl mx-auto">
          Search for lost items or browse what&apos;s been found across campus.
        </p>
        <div className="flex gap-3 justify-center mt-5">
          <Button variant="amber" asChild size="md">
            <Link href="/post/lost">Report Lost Item</Link>
          </Button>
          <Button variant="emerald" asChild size="md">
            <Link href="/post/found">Report Found Item</Link>
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <SearchBar value={search} onChange={handleSearchChange} />
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab || "all"} onValueChange={handleTabChange} className="mb-4">
        <TabsList>
          <TabsTrigger value="all" id="tab-all">All Items</TabsTrigger>
          <TabsTrigger value="lost" id="tab-lost">Lost</TabsTrigger>
          <TabsTrigger value="found" id="tab-found">Found</TabsTrigger>
        </TabsList>

        <TabsContent value={tab || "all"}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--border-clr)] overflow-hidden">
                  <div className="h-44 bg-[var(--bg-2)] animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[var(--bg-2)] rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-[var(--bg-2)] rounded animate-pulse w-full" />
                    <div className="h-3 bg-[var(--bg-2)] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-[var(--text-2)]">
              <p className="text-lg font-medium">Failed to load items</p>
              <p className="text-sm text-[var(--text-3)] mt-1">Please try again later.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <PackageOpen className="h-12 w-12 text-[var(--text-3)] mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-[var(--text-2)]">No items found</p>
              <p className="text-sm text-[var(--text-3)] mt-1">
                {search || Object.values(filters).some(Boolean)
                  ? "Try adjusting your search or filters."
                  : "Be the first to post a lost or found item!"}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[var(--text-3)]">
                  {data?.total ?? 0} item{(data?.total ?? 0) !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    id="prev-page-btn"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm text-[var(--text-2)]">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    id="next-page-btn"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

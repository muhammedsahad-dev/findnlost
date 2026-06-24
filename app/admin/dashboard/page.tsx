"use client";

export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { AdminItemRow } from "@/components/AdminItemRow";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { buildSearchParams } from "@/lib/utils";
import type { Item, ItemsResponse } from "@/types";
import { toast } from "sonner";

type SortField = "created_at" | "type" | "status";

async function fetchAllItems(params: Record<string, string | number | undefined>): Promise<ItemsResponse> {
  const qs = buildSearchParams(params);
  const res = await fetch(`/api/items?${qs}&includeRemoved=true`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export default function AdminDashboardPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const queryParams = {
    search: search || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    page,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-items", queryParams],
    queryFn: () => fetchAllItems(queryParams),
  });

  const items: Item[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleStatusChange = useCallback(
    (id: string, status: Item["status"]) => {
      queryClient.setQueryData(
        ["admin-items", queryParams],
        (old: ItemsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, status } : item
            ),
          };
        }
      );
    },
    [queryClient, queryParams]
  );

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  // Stats
  const openCount = items.filter((i) => i.status === "open").length;
  const claimedCount = items.filter((i) => i.status === "claimed").length;
  const removedCount = items.filter((i) => i.status === "removed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--text)]">Admin Dashboard</h1>
            <p className="text-xs text-[var(--text-3)]">Moderate all posts</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} id="refresh-btn">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total (page)", value: items.length, variant: "default" as const },
          { label: "Open", value: openCount, variant: "open" as const },
          { label: "Claimed", value: claimedCount, variant: "claimed" as const },
          { label: "Removed", value: removedCount, variant: "removed" as const },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--border-clr)] bg-[var(--bg)] p-4 text-center"
          >
            <p className="text-2xl font-bold font-display text-[var(--text)]">{stat.value}</p>
            <Badge variant={stat.variant} className="mt-1">{stat.label}</Badge>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search all posts…"
          className="flex-1"
        />
        <Select
          value={typeFilter || "__all__"}
          onValueChange={(v) => { setTypeFilter(v === "__all__" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-36" id="admin-type-filter">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter || "__all__"}
          onValueChange={(v) => { setStatusFilter(v === "__all__" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-36" id="admin-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border-clr)] bg-[var(--bg)] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-clr)] bg-[var(--bg-1)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Posted By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border-clr)]">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-[var(--bg-2)] animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-3)]">
                    Failed to load items. Try refreshing.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-3)]">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <AdminItemRow
                    key={item.id}
                    item={item}
                    posterEmail={item.users?.email}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            id="admin-prev-page"
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
            id="admin-next-page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

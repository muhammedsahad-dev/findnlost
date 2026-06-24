"use client";

import { useState } from "react";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

export interface FilterState {
  category: string;
  location: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const defaultFilters: FilterState = {
  category: "",
  location: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="rounded-xl border border-[var(--border-clr)] bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--bg-1)] transition-colors"
        aria-expanded={expanded}
        id="filter-toggle"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--text-3)]" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs px-1">
              {activeCount}
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[var(--text-3)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--text-3)]" />
        )}
      </button>

      {/* Panel */}
      {expanded && (
        <div className="border-t border-[var(--border-clr)] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-category">Category</Label>
            <Select
              value={filters.category || "__all__"}
              onValueChange={(v) => update("category", v === "__all__" ? "" : v)}
            >
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-location">Location</Label>
            <Input
              id="filter-location"
              placeholder="e.g. Library, Block B"
              value={filters.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-status">Status</Label>
            <Select
              value={filters.status || "__all__"}
              onValueChange={(v) => update("status", v === "__all__" ? "" : v)}
            >
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-date-from">From Date</Label>
            <Input
              id="filter-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update("dateFrom", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-date-to">To Date</Label>
            <Input
              id="filter-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => update("dateTo", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Reset */}
          {activeCount > 0 && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                id="filter-reset"
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

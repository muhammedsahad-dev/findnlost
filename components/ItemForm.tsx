"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/types";
import { itemSchema, type ItemFormValues } from "@/lib/validations/item.schema";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ItemType } from "@/types";

interface ItemFormProps {
  type: ItemType;
}

export function ItemForm({ type }: ItemFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { type },
  });

  const watchTitle = watch("title");
  const watchCategory = watch("category");
  const watchLocation = watch("location");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGenerateDescription = async () => {
    if (!watchTitle || !watchCategory || !watchLocation) {
      toast.error("Please fill in Title, Category, and Location first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: watchTitle,
          category: watchCategory,
          location: watchLocation,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate description");
      }
      const { description } = await res.json();
      setValue("description", description, { shouldValidate: true });
      toast.success("Description generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: ItemFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      let imageUrl: string | null = null;

      if (imageFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, image_url: imageUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create item");
      }

      const { item } = await res.json();
      toast.success("Item posted successfully!");
      router.push(`/items/${item.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "space-y-1.5";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Title */}
      <div className={fieldClass}>
        <Label htmlFor="item-title">Title *</Label>
        <Input
          id="item-title"
          placeholder={type === "lost" ? "e.g. Blue water bottle" : "e.g. Found ID card near cafeteria"}
          {...register("title")}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* Category */}
      <div className={fieldClass}>
        <Label htmlFor="item-category">Category *</Label>
        <Select onValueChange={(v) => setValue("category", v as ItemFormValues["category"], { shouldValidate: true })}>
          <SelectTrigger id="item-category" aria-invalid={!!errors.category}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className={errorClass}>{errors.category.message}</p>}
      </div>

      {/* AI Description Button */}
      <div className="rounded-lg border border-dashed border-[var(--border-clr)] bg-[var(--bg-1)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text)]">AI Description Generator</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Fill in Title, Category, and Location first, then generate a description automatically.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateDescription}
            isLoading={isGenerating}
            id="generate-description-btn"
            disabled={isGenerating || !watchTitle || !watchCategory || !watchLocation}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isGenerating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className={fieldClass}>
        <Label htmlFor="item-description">Description *</Label>
        <Textarea
          id="item-description"
          placeholder="Describe the item — color, size, any distinguishing features…"
          rows={4}
          {...register("description")}
          aria-invalid={!!errors.description}
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      {/* Location */}
      <div className={fieldClass}>
        <Label htmlFor="item-location">Location on Campus *</Label>
        <Input
          id="item-location"
          placeholder="e.g. Main Library, 2nd floor"
          {...register("location")}
          aria-invalid={!!errors.location}
        />
        {errors.location && <p className={errorClass}>{errors.location.message}</p>}
      </div>

      {/* Date */}
      <div className={fieldClass}>
        <Label htmlFor="item-date">{type === "lost" ? "Date Lost" : "Date Found"} *</Label>
        <Input
          id="item-date"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          {...register("date_occurred")}
          aria-invalid={!!errors.date_occurred}
        />
        {errors.date_occurred && <p className={errorClass}>{errors.date_occurred.message}</p>}
      </div>

      {/* Storage Location (found only) */}
      {type === "found" && (
        <div className={fieldClass}>
          <Label htmlFor="item-storage">Where is the item kept? (optional)</Label>
          <Input
            id="item-storage"
            placeholder="e.g. Security office, Block B"
            {...register("storage_location")}
          />
        </div>
      )}

      {/* Contact Info */}
      <div className={fieldClass}>
        <Label htmlFor="item-contact">Contact Info *</Label>
        <Input
          id="item-contact"
          placeholder="Phone, email, or social handle"
          {...register("contact_info")}
          aria-invalid={!!errors.contact_info}
        />
        {errors.contact_info && <p className={errorClass}>{errors.contact_info.message}</p>}
        <p className="text-xs text-[var(--text-3)]">
          Shown only on the item detail page to logged-in viewers.
        </p>
      </div>

      {/* Image Upload */}
      <div className={fieldClass}>
        <Label>Photo (optional)</Label>
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-clr)] bg-[var(--bg-1)] transition-colors cursor-pointer hover:border-amber-400",
            imagePreview ? "p-2" : "p-8"
          )}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload photo"
        >
          {imagePreview ? (
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-[var(--text-3)] mb-2" />
              <p className="text-sm text-[var(--text-2)]">Click to upload photo</p>
              <p className="text-xs text-[var(--text-3)] mt-1">JPG, PNG or WebP · max 5 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleImageChange}
            id="item-image-input"
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        variant={type === "lost" ? "amber" : "emerald"}
        className="w-full"
        isLoading={isSubmitting}
        id="submit-item-btn"
      >
        {isSubmitting ? "Posting…" : `Post ${type === "lost" ? "Lost" : "Found"} Item`}
      </Button>
    </form>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import { ItemDetailClient } from "./ItemDetailClient";
import type { Item } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("title, description, type, category")
    .eq("id", id)
    .neq("status", "removed")
    .single();

  if (!data) return { title: "Item Not Found" };

  return {
    title: data.title,
    description: data.description.slice(0, 160),
    openGraph: {
      title: `${data.type === "lost" ? "Lost" : "Found"}: ${data.title}`,
      description: data.description.slice(0, 160),
    },
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .neq("status", "removed")
    .single();

  if (!item) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ItemDetailClient item={item as Item} currentUserId={user?.id ?? null} />;
}

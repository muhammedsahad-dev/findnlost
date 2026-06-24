import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateStatusSchema } from "@/lib/validations/item.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .neq("status", "removed")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    console.error("[GET /api/items/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const isAdmin =
      (user.app_metadata as Record<string, string>)?.role === "admin" ||
      (user.user_metadata as Record<string, string>)?.role === "admin";

    // Fetch the item first to check ownership
    const { data: existing } = await supabase
      .from("items")
      .select("posted_by, status")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isOwner = existing.posted_by === user.id;

    // Owners can only claim; admins can remove/restore/claim
    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (parsed.data.status !== "claimed") {
        return NextResponse.json(
          { error: "Owners can only mark items as claimed" },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from("items")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    console.error("[PATCH /api/items/[id]]", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      (user.app_metadata as Record<string, string>)?.role === "admin" ||
      (user.user_metadata as Record<string, string>)?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/items/[id]]", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

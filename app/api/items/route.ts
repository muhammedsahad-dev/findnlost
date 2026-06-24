import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { itemSchema } from "@/lib/validations/item.schema";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = request.nextUrl;

    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const includeRemoved = searchParams.get("includeRemoved") === "true";
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("items").select("*, users(email)", { count: "exact" });

    // Status filtering
    if (includeRemoved) {
      // Admin mode — all statuses
    } else if (status) {
      query = query.eq("status", status);
    } else {
      query = query.neq("status", "removed");
    }

    if (type) query = query.eq("type", type);
    if (category) query = query.eq("category", category);
    if (location) query = query.ilike("location", `%${location}%`);

    // Full-text search
    if (search) {
      query = query.textSearch("search_vector", search, {
        type: "websearch",
        config: "english",
      });
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      items: data ?? [],
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err: unknown) {
    console.error("[GET /api/items]", err);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = itemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { image_url, ...values } = { image_url: body.image_url ?? null, ...parsed.data };

    const { data, error } = await supabase
      .from("items")
      .insert({
        ...values,
        image_url,
        posted_by: user.id,
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/items]", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

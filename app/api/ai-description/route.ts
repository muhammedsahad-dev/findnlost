import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiDescriptionSchema } from "@/lib/validations/item.schema";

const RATE_LIMIT = 10; // requests per hour

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse & validate body
    const body = await request.json();
    const parsed = aiDescriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Rate limiting — bucket by UTC hour
    const hourBucket = new Date();
    hourBucket.setMinutes(0, 0, 0);
    const bucketStr = hourBucket.toISOString();

    // Upsert rate limit counter
    const { data: rateData, error: rateError } = await supabase
      .from("ai_rate_limits")
      .upsert(
        { user_id: user.id, hour_bucket: bucketStr, count: 1 },
        { onConflict: "user_id,hour_bucket", ignoreDuplicates: false }
      )
      .select("count")
      .single();

    if (rateError) {
      // If upsert fails (row exists), increment manually
      const { data: existing } = await supabase
        .from("ai_rate_limits")
        .select("count")
        .eq("user_id", user.id)
        .eq("hour_bucket", bucketStr)
        .single();

      if (existing && existing.count >= RATE_LIMIT) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again next hour." },
          { status: 429 }
        );
      }

      await supabase
        .from("ai_rate_limits")
        .update({ count: (existing?.count ?? 0) + 1 })
        .eq("user_id", user.id)
        .eq("hour_bucket", bucketStr);
    } else if (rateData && rateData.count > RATE_LIMIT) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again next hour." },
        { status: 429 }
      );
    }

    const { type, title, category, location } = parsed.data;

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are a helpful assistant for a campus lost and found portal. 
Given an item title, category, and location, write a clear and concise 2-3 sentence 
description of the item that would help someone identify it. 
CRITICAL CONTEXT: The item is a "${type}" item (either "lost" or "found"). Your description 
must be written from the perspective of a "${type}" item. For example, if it is "lost", 
the description should describe the lost object as being searched for/lost. If it is "found", 
it should describe the object as being found/recovered.
Be factual and neutral. Do not invent specific details like brand names or colors 
unless provided. Output only the description text with no preamble.

Item details:
Item type: ${type}
Item title: ${title}
Category: ${category}
Location where it was ${type === "lost" ? "lost" : "found"}: ${location}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": "https://campus-lost-and-found.example.com",
          "X-Title": "Campus Lost and Found",
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ description });
  } catch (err: unknown) {
    console.error("[POST /api/ai-description]", err);
    return NextResponse.json(
      { error: "Failed to generate description: " + (err instanceof Error ? err.message : "Unknown error") },
      { status: 500 }
    );
  }
}

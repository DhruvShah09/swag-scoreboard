import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/score => Fetch all score changes from DB
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("score_changes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/score => Insert a new score change
export async function POST(request) {
  try {
    const { player, change, reason } = await request.json();

    // Basic validation
    if (!player || ![1, -1].includes(change) || !reason.trim()) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("score_changes")
      .insert([{ player, change, reason }])
      .select(); // We can return newly created row(s) with .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

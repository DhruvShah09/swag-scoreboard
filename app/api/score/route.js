// app/api/score/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

export async function POST(request) {
  try {
    const { player, change, reason } = await request.json();

    // Make sure player is either "A" or "B", change is a number, and reason is non-empty:
    if (!player || !["A", "B"].includes(player)) {
      return NextResponse.json({ error: "Invalid 'player'." }, { status: 400 });
    }
    if (typeof change !== "number" || Number.isNaN(change) || change === 0) {
      return NextResponse.json({ error: "Invalid 'change' amount." }, { status: 400 });
    }
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Reason is required." }, { status: 400 });
    }

    // Insert into DB
    const { data, error } = await supabase
      .from("score_changes")
      .insert([{ player, change, reason }])
      .select(); // Return the newly inserted row(s)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

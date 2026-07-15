import { NextResponse } from "next/server";
import { getAllAgents } from "@/lib/supabase";

export async function GET() {
  try {
    const agents = await getAllAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load agents", detail: String(error) },
      { status: 500 }
    );
  }
}

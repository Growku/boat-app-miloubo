import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const users = db.prepare("SELECT id, name FROM users ORDER BY id").all();
    return NextResponse.json(users);
  } catch (err) {
    console.error("Failed to load users:", err);
    return NextResponse.json(
      { error: "Database error", detail: String(err) },
      { status: 500 }
    );
  }
}

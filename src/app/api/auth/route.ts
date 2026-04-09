import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { user_id, pin } = body;

  if (!user_id || pin === undefined) {
    return NextResponse.json({ error: "user_id and pin are required" }, { status: 400 });
  }

  const user = db.prepare("SELECT id, name, pin FROM users WHERE id = ?").get(Number(user_id)) as
    | { id: number; name: string; pin: string }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (pin !== user.pin) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  return NextResponse.json({ id: user.id, name: user.name });
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { user_id, current_pin, new_pin } = body;

  if (!user_id || current_pin === undefined || new_pin === undefined) {
    return NextResponse.json(
      { error: "user_id, current_pin, and new_pin are required" },
      { status: 400 }
    );
  }

  if (!/^\d{4}$/.test(new_pin)) {
    return NextResponse.json(
      { error: "New PIN must be exactly 4 digits" },
      { status: 400 }
    );
  }

  const user = db.prepare("SELECT id, pin FROM users WHERE id = ?").get(Number(user_id)) as
    | { id: number; pin: string }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (current_pin !== user.pin) {
    return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 401 });
  }

  if (current_pin === new_pin) {
    return NextResponse.json({ error: "New PIN must be different" }, { status: 400 });
  }

  db.prepare("UPDATE users SET pin = ? WHERE id = ?").run(new_pin, Number(user_id));

  return NextResponse.json({ success: true });
}

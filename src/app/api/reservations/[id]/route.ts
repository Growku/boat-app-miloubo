import { NextResponse } from "next/server";

// This endpoint is disabled. Use DELETE /api/reservations?id=X&user_id=Y instead,
// which verifies ownership before deleting.
export async function DELETE() {
  return NextResponse.json(
    { error: "This endpoint is disabled. Use DELETE /api/reservations?id=X&user_id=Y" },
    { status: 410 }
  );
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const result = await db.query(`SELECT current_database() AS database, current_user AS user`);
  return NextResponse.json({
    status: "ok",
    service: "course-ai-nextjs",
    database: "connected",
    databaseName: result.rows[0].database,
    databaseUser: result.rows[0].user,
    timestamp: new Date().toISOString(),
  });
}

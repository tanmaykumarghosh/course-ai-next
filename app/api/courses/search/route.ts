import { NextRequest, NextResponse } from "next/server";
import { searchCourses } from "@/lib/courses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query) return NextResponse.json({ error: "INVALID_REQUEST", message: "query is required" }, { status: 400 });
    const result = await searchCourses(query, Number(body.limit ?? 5));
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "COURSE_SEARCH_FAILED", message: "Failed to search courses" }, { status: 500 });
  }
}

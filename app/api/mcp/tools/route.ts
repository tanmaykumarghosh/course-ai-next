import { NextResponse } from "next/server";
import { listTools } from "@/lib/tools/runner";

export async function GET() {
  return NextResponse.json({ tools: listTools() });
}

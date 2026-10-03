import { NextRequest, NextResponse } from "next/server";
import { executeTool, listTools } from "@/lib/tools/runner";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!listTools().some((tool) => tool.name === body.name)) {
    return NextResponse.json({ error: "TOOL_NOT_FOUND", message: `MCP tool not found: ${body.name}` }, { status: 404 });
  }
  try {
    const result = await executeTool(body.name, JSON.stringify(body.arguments ?? {}), {
      conversationId: body.conversationId,
      responseId: body.responseId,
    });
    return NextResponse.json({ name: body.name, result });
  } catch (error) {
    return NextResponse.json({ error: "TOOL_FAILED", message: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

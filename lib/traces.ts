import { db } from "./db";

export async function saveToolTrace(input: {
  conversationId?: string;
  responseId?: string;
  toolName: string;
  toolArguments: unknown;
  toolResult: unknown;
  status: string;
  errorCode?: string;
  durationMs?: number;
}) {
  await db.query(
    `INSERT INTO ai_tool_traces
      (conversation_id, response_id, tool_name, arguments, result, status, error_code, duration_ms)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8)`,
    [
      input.conversationId ?? null,
      input.responseId ?? null,
      input.toolName,
      JSON.stringify(normalizeJson(input.toolArguments)),
      JSON.stringify(normalizeJson(input.toolResult)),
      input.status,
      input.errorCode ?? null,
      input.durationMs ?? null,
    ],
  );
}

function normalizeJson(value: unknown) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}

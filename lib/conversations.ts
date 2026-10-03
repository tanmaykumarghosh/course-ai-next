import { db } from "./db";

export async function getConversation(conversationId: string) {
  const result = await db.query(
    `SELECT id, conversation_id, last_response_id, created_at, updated_at
     FROM conversations
     WHERE conversation_id = $1
     LIMIT 1`,
    [conversationId],
  );

  return result.rows[0] ?? null;
}

export async function createConversation(conversationId: string) {
  const result = await db.query(
    `INSERT INTO conversations (
       conversation_id
     )
     VALUES ($1)
     RETURNING id, conversation_id, last_response_id, created_at, updated_at`,
    [conversationId],
  );

  return result.rows[0];
}

export async function getOrCreateConversation(
  conversationId: string,
) {
  const existing = await getConversation(conversationId);

  if (existing) {
    return existing;
  }

  return createConversation(conversationId);
}

export async function updateConversationResponse(
  conversationId: string,
  responseId: string,
) {
  const result = await db.query(
    `UPDATE conversations
     SET last_response_id = $1,
         updated_at = NOW()
     WHERE conversation_id = $2
     RETURNING id, conversation_id, last_response_id, created_at, updated_at`,
    [responseId, conversationId],
  );

  return result.rows[0] ?? null;
}
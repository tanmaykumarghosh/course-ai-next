import { db } from "./db";

export type ConversationMessageRole =
  | "user"
  | "assistant";

export async function saveConversationMessage(
  conversationId: string,
  role: ConversationMessageRole,
  content: string,
  responseId?: string | null,
) {
  const result = await db.query(
    `INSERT INTO conversation_messages (
       conversation_id,
       role,
       content,
       response_id
     )
     SELECT
       id,
       $2,
       $3,
       $4
     FROM conversations
     WHERE conversation_id = $1
     RETURNING id, conversation_id, role, content,
               response_id, created_at`,
    [
      conversationId,
      role,
      content,
      responseId ?? null,
    ],
  );

  return result.rows[0] ?? null;
}

export async function getConversationMessages(
  conversationId: string,
) {
  const result = await db.query(
    `SELECT
       cm.id,
       c.conversation_id,
       cm.role,
       cm.content,
       cm.response_id,
       cm.created_at
     FROM conversation_messages cm
     INNER JOIN conversations c
       ON c.id = cm.conversation_id
     WHERE c.conversation_id = $1
     ORDER BY cm.created_at ASC, cm.id ASC`,
    [conversationId],
  );

  return result.rows;
}

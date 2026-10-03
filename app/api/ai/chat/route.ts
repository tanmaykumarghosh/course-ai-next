import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { runCourseAI } from "../../../../lib/ai";
import { getOrCreateConversation } from "../../../../lib/conversations";
import { saveConversationMessage } from "../../../../lib/conversation-messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 },
      );
    }

    let conversationId =
      typeof body.conversationId === "string" &&
      body.conversationId.trim()
        ? body.conversationId.trim()
        : randomUUID();

    const conversation =
      await getOrCreateConversation(conversationId);

    conversationId = conversation.conversation_id;

    /*
     * Save the student's message.
     */
    await saveConversationMessage(
      conversationId,
      "user",
      message,
    );

    /*
     * Run AI using the previous response ID.
     */
    const result = await runCourseAI(
      message,
      conversationId,
      conversation.last_response_id,
    );

    /*
     * Save the AI response.
     */
    await saveConversationMessage(
      conversationId,
      "assistant",
      result.text,
      result.responseId,
    );

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        responseId: result.responseId,
        message: result.text,
        courses: result.courses ?? [],
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AI request failed",
      },
      { status: 500 },
    );
  }
}
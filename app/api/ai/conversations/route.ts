import { NextRequest, NextResponse } from "next/server";

import {
  getConversationMessages,
} from "../../../../lib/conversation-messages";

import {
  getConversation,
} from "../../../../lib/conversations";

export async function GET(request: NextRequest) {
  try {
    const conversationId =
      request.nextUrl.searchParams.get(
        "conversationId",
      );

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "conversationId is required",
        },
        { status: 400 },
      );
    }

    const conversation =
      await getConversation(conversationId);

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found",
        },
        { status: 404 },
      );
    }

    const messages =
      await getConversationMessages(conversationId);

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        messages,
      },
    });
  } catch (error) {
    console.error(
      "Conversation history error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load conversation",
      },
      { status: 500 },
    );
  }
}

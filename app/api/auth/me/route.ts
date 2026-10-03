import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Auth session error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify session",
      },
      { status: 500 },
    );
  }
}

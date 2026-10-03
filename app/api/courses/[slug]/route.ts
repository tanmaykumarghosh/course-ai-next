import { NextRequest, NextResponse } from "next/server";

import { getCourseBySlug } from "../../../../lib/courses";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { slug } = await context.params;

    const course = await getCourseBySlug(slug);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Course detail error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load course",
      },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";

import { listCourses } from "../../../lib/courses";

export async function GET() {
  try {
    const courses = await listCourses();

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Course list error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load courses",
      },
      { status: 500 },
    );
  }
}

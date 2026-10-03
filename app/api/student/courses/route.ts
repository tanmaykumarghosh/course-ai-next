import { NextResponse } from "next/server";

import { getSession } from "../../../../lib/auth/session";
import { db } from "../../../../lib/db";

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

    const result = await db.query(
      `
      SELECT
        c.id,
        c.course_name,
        c.slug,
        c.category,
        c.technology,
        c.level,
        c.duration,
        c.total_hours,
        c.fees,
        c.mode,
        c.language,
        c.certificate,
        c.live_projects,
        c.internship,
        c.job_assistance,

        p.purchase_number,
        p.status AS purchase_status,
        p.created_at AS enrolled_at

      FROM purchases p

      INNER JOIN purchase_items pi
        ON pi.purchase_id = p.id

      INNER JOIN courses c
        ON c.id = pi.course_id

      WHERE p.student_id = $1

      ORDER BY p.created_at DESC
      `,
      [session.id],
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Student courses error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load courses",
      },
      { status: 500 },
    );
  }
}

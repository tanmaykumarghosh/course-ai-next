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
        p.id,
        p.purchase_number,
        p.status,
        p.currency,
        p.total_amount,
        p.created_at,

        pi.id AS item_id,
        pi.quantity,
        pi.unit_price,
        pi.total_price,

        c.id AS course_id,
        c.course_name,
        c.slug,
        c.category,
        c.level,
        c.duration

      FROM purchases p

      INNER JOIN purchase_items pi
        ON pi.purchase_id = p.id

      INNER JOIN courses c
        ON c.id = pi.course_id

      WHERE p.student_id = $1

      ORDER BY p.created_at DESC, pi.id ASC
      `,
      [session.id],
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Student purchases error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load purchases",
      },
      { status: 500 },
    );
  }
}

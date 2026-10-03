import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth/session";

type RouteContext = {
  params: Promise<{
    purchaseNumber: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const { purchaseNumber } = await context.params;

    const result = await db.query(
      `SELECT
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
         c.technology,
         c.level,
         c.duration,
         c.total_hours,
         c.mode,
         c.language,
         c.certificate,
         c.live_projects,
         c.internship,
         c.job_assistance
       FROM purchases p
       INNER JOIN purchase_items pi
         ON pi.purchase_id = p.id
       INNER JOIN courses c
         ON c.id = pi.course_id
       WHERE p.purchase_number = $1
         AND p.student_id = $2
       ORDER BY pi.id`,
      [purchaseNumber, session.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase not found",
        },
        { status: 404 },
      );
    }

    const first = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        purchase: {
          id: first.id,
          purchase_number: first.purchase_number,
          status: first.status,
          currency: first.currency,
          total_amount: first.total_amount,
          created_at: first.created_at,
        },
        items: result.rows.map((row) => ({
          id: row.item_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total_price: row.total_price,
          course: {
            id: row.course_id,
            course_name: row.course_name,
            slug: row.slug,
            category: row.category,
            technology: row.technology,
            level: row.level,
            duration: row.duration,
            total_hours: row.total_hours,
            mode: row.mode,
            language: row.language,
            certificate: row.certificate,
            live_projects: row.live_projects,
            internship: row.internship,
            job_assistance: row.job_assistance,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Purchase detail error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load purchase",
      },
      { status: 500 },
    );
  }
}
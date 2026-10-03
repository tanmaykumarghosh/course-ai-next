import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getSession } from "../../../lib/auth/session";

function generatePurchaseNumber() {
  const timestamp = Date.now();

  return `ORD-${timestamp}`;
}

export async function POST(request: NextRequest) {
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
    const idempotencyKey =
      request.headers.get("Idempotency-Key")?.trim();

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Idempotency-Key header is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const courseId = Number(body.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid courseId is required",
        },
        { status: 400 },
      );
    }

    const courseResult = await db.query(
      `SELECT
         id,
         course_name,
         slug,
         fees,
         status
       FROM courses
       WHERE id = $1
       LIMIT 1`,
      [courseId],
    );

    const course = courseResult.rows[0];

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 },
      );
    }

    if (course.status !== "Active") {
      return NextResponse.json(
        {
          success: false,
          error: "Course is not available",
        },
        { status: 400 },
      );
    }

    /*
     * Prevent accidental duplicate enrollment.
     */
  /*
 * Prevent duplicate request with the same idempotency key.
 */
  const existingPurchase = await db.query(
    `SELECT
      id,
      purchase_number,
      student_id,
      status,
      currency,
      total_amount,
      created_at
    FROM purchases
    WHERE idempotency_key = $1
    LIMIT 1`,
    [idempotencyKey],
  );

  if (existingPurchase.rows.length > 0) {
    return NextResponse.json({
      success: true,
      idempotent: true,
      message: "Existing purchase returned",
      data: {
        purchase: existingPurchase.rows[0],
      },
    });
  }

  /*
  * Prevent the same student from enrolling in the same course
  * more than once.
  */
  const existingResult = await db.query(
    `SELECT
      p.id,
      p.purchase_number,
      p.student_id,
      p.status,
      p.currency,
      p.total_amount,
      p.created_at
    FROM purchases p
    INNER JOIN purchase_items pi
      ON pi.purchase_id = p.id
    WHERE p.student_id = $1
      AND pi.course_id = $2
      AND p.status IN ('PENDING', 'PAID', 'COMPLETED')
    LIMIT 1`,
    [session.id, course.id],
  );

  if (existingResult.rows.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "You have already purchased this course",
        data: {
          purchase: existingResult.rows[0],
        },
      },
      { status: 409 },
    );
  }
    const purchaseNumber = generatePurchaseNumber();

   

    const client = await db.connect();

    try {
      await client.query("BEGIN");

     const purchaseResult = await client.query(
      `INSERT INTO purchases (
        purchase_number,
        student_id,
        status,
        currency,
        total_amount,
        idempotency_key
      )
      VALUES ($1, $2, 'PENDING', 'INR', $3, $4)
      RETURNING
        id,
        purchase_number,
        student_id,
        status,
        currency,
        total_amount,
        created_at`,
      [
        purchaseNumber,
        session.id,
        course.fees,
        idempotencyKey,
      ],
    );

      const purchase = purchaseResult.rows[0];

      const itemResult = await client.query(
        `INSERT INTO purchase_items (
           purchase_id,
           course_id,
           quantity,
           unit_price,
           total_price
         )
         VALUES ($1, $2, 1, $3, $3)
         RETURNING
           id,
           purchase_id,
           course_id,
           quantity,
           unit_price,
           total_price`,
        [
          purchase.id,
          course.id,
          course.fees,
        ],
      );

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Purchase created successfully",
          data: {
            purchase,
            item: itemResult.rows[0],
            course: {
              id: course.id,
              course_name: course.course_name,
              slug: course.slug,
              fees: course.fees,
            },
          },
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Purchase creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create purchase",
      },
      { status: 500 },
    );
  }
}
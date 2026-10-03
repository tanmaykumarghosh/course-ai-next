import { db } from "./db";
import { BusinessError } from "./errors";

export async function getPurchase(purchaseNumber: string) {
  const result = await db.query(
    `SELECT p.id, p.purchase_number, p.status, p.currency, p.total_amount,
            p.created_at, p.updated_at,
            s.id AS student_id, s.student_code, s.name AS student_name,
            s.email AS student_email, s.phone AS student_phone,
            pi.id AS purchase_item_id, pi.quantity, pi.unit_price, pi.total_price,
            c.id AS course_id, c.slug, c.course_name
     FROM purchases p
     JOIN students s ON s.id = p.student_id
     LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
     LEFT JOIN courses c ON c.id = pi.course_id
     WHERE p.purchase_number = $1
     ORDER BY pi.id`,
    [purchaseNumber],
  );

  if (result.rows.length === 0) return null;
  const first = result.rows[0];

  return {
    id: first.id,
    purchaseNumber: first.purchase_number,
    status: first.status,
    currency: first.currency,
    totalAmount: first.total_amount,
    createdAt: first.created_at,
    updatedAt: first.updated_at,
    student: {
      id: first.student_id,
      code: first.student_code,
      name: first.student_name,
      email: first.student_email,
      phone: first.student_phone,
    },
    items: result.rows
      .filter((row) => row.purchase_item_id !== null)
      .map((row) => ({
        id: row.purchase_item_id,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        totalPrice: row.total_price,
        course: { id: row.course_id, slug: row.slug, name: row.course_name },
      })),
  };
}

export async function createPurchase(input: {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseSlug: string;
  idempotencyKey: string;
}) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id, purchase_number, status, currency, total_amount, created_at, updated_at
       FROM purchases WHERE idempotency_key = $1`,
      [input.idempotencyKey],
    );
    if (existing.rows.length) {
      await client.query("COMMIT");
      return { existing: true, purchase: existing.rows[0] };
    }

    const courseResult = await client.query(
      `SELECT id, course_name, slug, fees FROM courses
       WHERE slug = $1 AND status = 'Active'`,
      [input.courseSlug],
    );
    const course = courseResult.rows[0];
    if (!course) {
      throw new BusinessError("COURSE_NOT_FOUND", `Course ${input.courseSlug} was not found`, { slug: input.courseSlug });
    }

    const studentCode = `STU-${input.studentEmail.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16)}`;
    const studentResult = await client.query(
      `INSERT INTO students (student_code, name, email, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, phone = COALESCE(EXCLUDED.phone, students.phone), updated_at = NOW()
       RETURNING id, student_code, name, email, phone`,
      [studentCode, input.studentName, input.studentEmail, input.studentPhone ?? null],
    );
    const student = studentResult.rows[0];
    const total = Number(course.fees);

    const numberResult = await client.query(
      `SELECT 'PUR-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(purchase_number FROM 5) AS INTEGER)), 1000) + 1)::text, 4, '0') AS purchase_number
       FROM purchases WHERE purchase_number LIKE 'PUR-%'`,
    );
    const purchaseNumber = numberResult.rows[0].purchase_number;

    const purchaseResult = await client.query(
      `INSERT INTO purchases (purchase_number, student_id, status, currency, total_amount, idempotency_key)
       VALUES ($1, $2, 'PENDING', 'INR', $3, $4)
       RETURNING id, purchase_number, status, currency, total_amount, created_at, updated_at`,
      [purchaseNumber, student.id, total, input.idempotencyKey],
    );
    const purchase = purchaseResult.rows[0];

    await client.query(
      `INSERT INTO purchase_items (purchase_id, course_id, quantity, unit_price, total_price)
       VALUES ($1, $2, 1, $3, $4)`,
      [purchase.id, course.id, course.fees, total],
    );

    await client.query("COMMIT");

    return {
      existing: false,
      purchase: {
        ...purchase,
        student: {
          code: student.student_code,
          name: student.name,
          email: student.email,
          phone: student.phone,
        },
        item: {
          slug: course.slug,
          name: course.course_name,
          quantity: 1,
          unitPrice: course.fees,
          totalPrice: total.toFixed(2),
        },
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

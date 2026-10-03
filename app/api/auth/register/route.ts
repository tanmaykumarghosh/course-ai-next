import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email and password are required",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters",
        },
        { status: 400 },
      );
    }

    const existingStudent = await db.query(
      `SELECT id
       FROM students
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email],
    );

    if (existingStudent.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A student with this email already exists",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const studentCode = `STU-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO students (
         student_code,
         name,
         email,
         phone,
         password_hash,
         status
       )
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
       RETURNING
         id,
         student_code,
         name,
         email,
         phone,
         status,
         created_at`,
      [
        studentCode,
        name,
        email,
        phone || null,
        passwordHash,
      ],
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: "Student registered successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Student registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Registration failed",
      },
      { status: 500 },
    );
  }
}

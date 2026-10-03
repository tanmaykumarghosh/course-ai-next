import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../lib/db";
import { createSession } from "../../../../lib/auth/session";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      );
    }

    const result = await db.query(
      `SELECT
         id,
         student_code,
         name,
         email,
         phone,
         password_hash,
         status
       FROM students
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email],
    );

    const student = result.rows[0];

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    if (student.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Student account is not active",
        },
        { status: 403 },
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      student.password_hash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }
    await createSession({
      id: String(student.id),
      student_code: student.student_code,
      name: student.name,
      email: student.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        student_code: student.student_code,
        name: student.name,
        email: student.email,
        phone: student.phone,
        status: student.status,
      },
      message: "Login successful",
    });
    
  } catch (error) {
    console.error("Student login error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Login failed",
      },
      { status: 500 },
    );
  }
}

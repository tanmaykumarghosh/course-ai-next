"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Course = {
  id: number;
  course_name: string;
  slug: string;
  category: string | null;
  technology: string | null;
  level: string | null;
  duration: string | null;
  total_hours: number | null;
  fees: string | number;
  mode: string | null;
  language: string | null;
  certificate: boolean;
  live_projects: number;
  internship: boolean;
  job_assistance: boolean;
  prerequisites: string | null;
};

type Student = {
  id: string;
  student_code: string;
  name: string;
  email: string;
};

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();

  const slug = String(params.slug);

  const [course, setCourse] = useState<Course | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");

  const [idempotencyKey] = useState(() =>
        crypto.randomUUID(),
      );

  useEffect(() => {
    async function load() {
      try {
        const [courseResponse, authResponse] =
          await Promise.all([
            fetch(`/api/courses/${slug}`),
            fetch("/api/auth/me"),
          ]);

        const courseData =
          await courseResponse.json();

        const authData =
          await authResponse.json();

        if (!courseResponse.ok || !courseData.success) {
          throw new Error(
            courseData.error || "Unable to load course",
          );
        }

        if (!authResponse.ok || !authData.success) {
          router.replace(
            `/login?redirect=/courses/${slug}/enroll`,
          );
          return;
        }

        setCourse(courseData.data);
        setStudent(authData.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load enrollment page",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug, router]);

  async function handlePurchase() {
    if (!course) return;

    setError("");
    setPurchasing(true);

    try {
     
      const response = await fetch(
        "/api/purchases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            courseId: course.id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to create purchase",
        );
      }

      router.push(
        `/student/purchases/${data.data.purchase.purchase_number}`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create purchase",
      );
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <p>Loading enrollment...</p>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>Enrollment</h1>
          <p style={{ color: "#b91c1c" }}>
            {error}
          </p>

          <Link href="/courses">
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  if (!course || !student) {
    return null;
  }

  return (
    <main style={pageStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
        }}
      >
        <div style={cardStyle}>
          <h1>Enroll in Course</h1>

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "10px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {course.course_name}
            </h2>

            <p>
              <strong>Category:</strong>{" "}
              {course.category || "N/A"}
            </p>

            <p>
              <strong>Level:</strong>{" "}
              {course.level || "N/A"}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {course.duration || "N/A"}
            </p>

            <p>
              <strong>Mode:</strong>{" "}
              {course.mode || "N/A"}
            </p>

            <p>
              <strong>Technology:</strong>{" "}
              {course.technology || "N/A"}
            </p>

            <div
              style={{
                marginTop: "20px",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              ₹
              {Number(course.fees).toLocaleString(
                "en-IN",
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
            }}
          >
            <h3>Student Information</h3>

            <p>
              <strong>Name:</strong>{" "}
              {student.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {student.email}
            </p>

            <p>
              <strong>Student Code:</strong>{" "}
              {student.student_code}
            </p>
          </div>

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "7px",
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={purchasing}
            style={{
              width: "100%",
              marginTop: "25px",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "#fff",
              fontSize: "17px",
              fontWeight: 600,
              cursor: purchasing
                ? "not-allowed"
                : "pointer",
            }}
          >
            {purchasing
              ? "Processing..."
              : `Confirm Enrollment — ₹${Number(
                  course.fees,
                ).toLocaleString("en-IN")}`}
          </button>

          <Link
            href={`/courses/${course.slug}`}
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "18px",
            }}
          >
            Back to Course
          </Link>
        </div>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f5f5",
  padding: "40px 20px",
  display: "flex",
  justifyContent: "center",
};

const cardStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

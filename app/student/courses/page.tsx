"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  course_name: string;
  slug: string;
  category: string;
  technology: string;
  level: string;
  duration: string;
  total_hours: number;
  fees: string;
  mode: string;
  language: string;
  certificate: boolean;
  live_projects: number;
  internship: boolean;
  job_assistance: boolean;

  purchase_number: string;
  purchase_status: string;
  enrolled_at: string;
};

export default function MyCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch("/api/student/courses");

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load courses");
        }

        setCourses(data.data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load courses",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [router]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <h1>My Courses</h1>
        <p>Loading courses...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "8px" }}>
            My Courses
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            Courses you have enrolled in.
          </p>
        </div>

        <Link
          href="/student/dashboard"
          style={{
            padding: "10px 16px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#333",
          }}
        >
          Dashboard
        </Link>
      </div>

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            background: "#fee",
            border: "1px solid #f5b5b5",
            borderRadius: "6px",
            color: "#a00",
          }}
        >
          {error}
        </div>
      )}

      {!error && courses.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "50px 20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fafafa",
          }}
        >
          <h2>No courses yet</h2>

          <p style={{ color: "#666" }}>
            You have not enrolled in any courses yet.
          </p>

          <Link
            href="/courses"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "12px 20px",
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Browse Courses
          </Link>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {courses.map((course) => (
          <div
            key={`${course.id}-${course.purchase_number}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "24px",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "21px",
                }}
              >
                {course.course_name}
              </h2>

              <span
                style={{
                  whiteSpace: "nowrap",
                  padding: "5px 9px",
                  borderRadius: "15px",
                  background: "#f3f3f3",
                  fontSize: "12px",
                }}
              >
                {course.purchase_status}
              </span>
            </div>

            <p
              style={{
                color: "#666",
                marginTop: "10px",
              }}
            >
              {course.category}
            </p>

            <div
              style={{
                marginTop: "20px",
                display: "grid",
                gap: "10px",
                color: "#555",
              }}
            >
              <div>
                <strong>Level:</strong> {course.level}
              </div>

              <div>
                <strong>Duration:</strong> {course.duration}
              </div>

              <div>
                <strong>Mode:</strong> {course.mode}
              </div>

              <div>
                <strong>Technology:</strong>{" "}
                {course.technology}
              </div>

              <div>
                <strong>Total Hours:</strong>{" "}
                {course.total_hours}
              </div>

              <div>
                <strong>Enrolled:</strong>{" "}
                {formatDate(course.enrolled_at)}
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={`/courses/${course.slug}`}
                style={{
                  padding: "10px 15px",
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "6px",
                }}
              >
                View Course
              </Link>

              <Link
                href={`/student/purchases/${course.purchase_number}`}
                style={{
                  padding: "10px 15px",
                  border: "1px solid #ddd",
                  color: "#333",
                  textDecoration: "none",
                  borderRadius: "6px",
                }}
              >
                Purchase Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <main className="container">
      <div className="card">
        <h1>{course.course_name}</h1>
        <p>{course.technology}</p>
        <p><strong>Category:</strong> {course.category}</p>
        <p><strong>Level:</strong> {course.level}</p>
        <p><strong>Duration:</strong> {course.duration}</p>
        <p><strong>Total hours:</strong> {course.total_hours}</p>
        <p><strong>Mode:</strong> {course.mode}</p>
        <p><strong>Prerequisites:</strong> {course.prerequisites}</p>
        <p><strong>Certificate:</strong> {course.certificate ? "Yes" : "No"}</p>
        <p><strong>Live projects:</strong> {course.live_projects}</p>
        <p><strong>Internship:</strong> {course.internship ? "Yes" : "No"}</p>
        <p><strong>Job assistance:</strong> {course.job_assistance ? "Yes" : "No"}</p>
        <p className="price">₹{Number(course.fees).toLocaleString("en-IN")}</p>
        <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <Link
          href={`/courses/${course.slug}/enroll`}
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "#111827",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Enroll / Buy Now
        </Link>

        <Link
          href="/courses"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#333",
          }}
        >
          Back to Courses
        </Link>
      </div>
      </div>
    </main>
  );
}

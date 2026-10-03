import Link from "next/link";

type Course = {
  id: number;
  course_name: string;
  slug: string;
  category: string | null;
  technology: string | null;
  level: string | null;
  duration: string | null;
  total_hours: number | null;
  fees: number;
  mode: string | null;
  language: string | null;
  certificate: boolean;
  live_projects: number;
  internship: boolean;
  job_assistance: boolean;
  prerequisites: string | null;
  image: string | null;
};

async function getCourses(): Promise<Course[]> {
  const response = await fetch(
    "http://localhost:3000/api/courses",
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load courses");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      data.error || "Unable to load courses",
    );
  }

  return data.data;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          marginBottom: "35px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "36px",
          }}
        >
          Our Courses
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#666",
            fontSize: "18px",
          }}
        >
          Explore our technical training courses.
        </p>
      </div>

      {courses.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          No courses available.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {courses.map((course) => (
            <article
              key={course.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "22px",
                background: "#fff",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {course.image && (
                <img
                  src={course.image}
                  alt={course.course_name}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                />
              )}

              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                {course.category}
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "22px",
                }}
              >
                {course.course_name}
              </h2>

              <p
                style={{
                  margin: "8px 0",
                  color: "#555",
                }}
              >
                <strong>Technology:</strong>{" "}
                {course.technology || "N/A"}
              </p>

              <p
                style={{
                  margin: "8px 0",
                  color: "#555",
                }}
              >
                <strong>Level:</strong>{" "}
                {course.level || "N/A"}
              </p>

              <p
                style={{
                  margin: "8px 0",
                  color: "#555",
                }}
              >
                <strong>Duration:</strong>{" "}
                {course.duration || "N/A"}
              </p>

              <p
                style={{
                  margin: "8px 0",
                  color: "#555",
                }}
              >
                <strong>Mode:</strong>{" "}
                {course.mode || "N/A"}
              </p>

              <p
                style={{
                  margin: "12px 0",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                ₹
                {Number(course.fees).toLocaleString(
                  "en-IN",
                )}
              </p>

              <Link
                href={`/courses/${course.slug}`}
                style={{
                  display: "inline-block",
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "center",
                  padding: "11px 15px",
                  borderRadius: "6px",
                  background: "#0070f3",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                View Course
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
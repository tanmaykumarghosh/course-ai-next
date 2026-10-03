"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  student_code: string;
  name: string;
  email: string;
};

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const response = await fetch("/api/auth/me");

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          router.replace("/login");
          return;
        }

        setStudent(data.data);
      } catch (error) {
        console.error("Unable to load student:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      localStorage.removeItem("course_ai_student");
      router.replace("/login");
    }
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
        <h1>Student Dashboard</h1>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px 20px 50px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "35px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: "8px",
            }}
          >
            Student Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            Welcome, {student.name}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Student Profile */}
      <section
        style={{
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: "#fff",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          My Profile
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <strong>Name</strong>
            <div>{student.name}</div>
          </div>

          <div>
            <strong>Email</strong>
            <div>{student.email}</div>
          </div>

          <div>
            <strong>Student Code</strong>
            <div>{student.student_code}</div>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section>
        <h2
          style={{
            marginBottom: "20px",
          }}
        >
          Student Area
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
          }}
        >
          {/* My Courses */}
          <DashboardCard
            title="My Courses"
            description="View the courses you have enrolled in."
            href="/student/courses"
            buttonText="View My Courses"
          />

          {/* Purchases */}
          <DashboardCard
            title="Purchase History"
            description="View your enrollment and purchase records."
            href="/student/purchases"
            buttonText="View Purchases"
          />

          {/* AI Advisor */}
          <DashboardCard
            title="AI Course Advisor"
            description="Ask AI to help you find the right course."
            href="/ai"
            buttonText="Open AI Advisor"
          />

          {/* Browse Courses */}
          <DashboardCard
            title="Browse Courses"
            description="Explore all available courses."
            href="/courses"
            buttonText="Browse Courses"
          />
        </div>
      </section>

      {/* Quick Navigation */}
      <section
        style={{
          marginTop: "40px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: "#fafafa",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          Quick Navigation
        </h2>

        <nav
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <NavButton
            href="/student/courses"
            text="My Courses"
          />

          <NavButton
            href="/student/purchases"
            text="Purchase History"
          />

          <NavButton
            href="/ai"
            text="AI Course Advisor"
          />

          <NavButton
            href="/courses"
            text="Browse Courses"
          />
        </nav>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "24px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        minHeight: "180px",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#666",
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {description}
      </p>

      <Link
        href={href}
        style={{
          display: "inline-block",
          padding: "10px 15px",
          background: "#111",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "6px",
          textAlign: "center",
        }}
      >
        {buttonText}
      </Link>
    </div>
  );
}

function NavButton({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#fff",
        color: "#333",
        textDecoration: "none",
      }}
    >
      {text}
    </Link>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Purchase = {
  id: string;
  purchase_number: string;
  status: string;
  currency: string;
  total_amount: string | number;
  created_at: string;
};

type PurchaseItem = {
  id: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  course: {
    id: string;
    course_name: string;
    slug: string;
    category: string | null;
    technology: string | null;
    level: string | null;
    duration: string | null;
    total_hours: number | null;
    mode: string | null;
    language: string | null;
    certificate: boolean;
    live_projects: number;
    internship: boolean;
    job_assistance: boolean;
  };
};

type PurchaseResponse = {
  purchase: Purchase;
  items: PurchaseItem[];
};

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const purchaseNumber = String(
    params.purchaseNumber,
  );

  const [data, setData] =
    useState<PurchaseResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPurchase() {
      try {
        const response = await fetch(
          `/api/purchases/${purchaseNumber}`,
        );

        const result = await response.json();

        if (response.status === 401) {
          router.replace(
            `/login?redirect=/student/purchases/${purchaseNumber}`,
          );
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Unable to load purchase",
          );
        }

        setData(result.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load purchase",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPurchase();
  }, [purchaseNumber, router]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <p>Loading purchase...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>Purchase</h1>

          <p style={{ color: "#b91c1c" }}>
            {error || "Purchase not found"}
          </p>

          <Link href="/student/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { purchase, items } = data;

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "10px",
              }}
            >
              ✓
            </div>

            <h1>Enrollment Created</h1>

            <p style={{ color: "#666" }}>
              Your course enrollment request has
              been created successfully.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "10px",
              marginBottom: "25px",
            }}
          >
            <p>
              <strong>Purchase Number:</strong>{" "}
              {purchase.purchase_number}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {purchase.status}
            </p>

            <p>
              <strong>Total:</strong>{" "}
              ₹
              {Number(
                purchase.total_amount,
              ).toLocaleString("en-IN")}
            </p>

            <p style={{ marginBottom: 0 }}>
              <strong>Date:</strong>{" "}
              {new Date(
                purchase.created_at,
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <h2>Course</h2>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "15px",
              }}
            >
              <h3>
                {item.course.course_name}
              </h3>

              <p>
                <strong>Category:</strong>{" "}
                {item.course.category || "N/A"}
              </p>

              <p>
                <strong>Level:</strong>{" "}
                {item.course.level || "N/A"}
              </p>

              <p>
                <strong>Duration:</strong>{" "}
                {item.course.duration || "N/A"}
              </p>

              <p>
                <strong>Mode:</strong>{" "}
                {item.course.mode || "N/A"}
              </p>

              <p>
                <strong>Price:</strong> ₹
                {Number(
                  item.total_price,
                ).toLocaleString("en-IN")}
              </p>
            </div>
          ))}

          {purchase.status === "PENDING" && (
            <div
              style={{
                marginTop: "25px",
                padding: "15px",
                background: "#fff7ed",
                color: "#9a3412",
                borderRadius: "8px",
              }}
            >
              Payment is pending. We will connect
              the payment gateway in the next step.
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/student/courses"
              style={buttonStyle}
            >
              My Courses
            </Link>

            <Link
              href="/student/dashboard"
              style={secondaryButtonStyle}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f5f5",
  padding: "40px 20px",
};

const containerStyle = {
  maxWidth: "750px",
  margin: "0 auto",
};

const cardStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const buttonStyle = {
  display: "inline-block",
  padding: "12px 20px",
  background: "#111827",
  color: "#fff",
  borderRadius: "7px",
  textDecoration: "none",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  display: "inline-block",
  padding: "12px 20px",
  border: "1px solid #ccc",
  color: "#333",
  borderRadius: "7px",
  textDecoration: "none",
};

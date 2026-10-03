"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Purchase = {
  id: string;
  purchase_number: string;
  status: string;
  currency: string;
  total_amount: string;
  created_at: string;

  item_id: string;
  quantity: number;
  unit_price: string;
  total_price: string;

  course_id: string;
  course_name: string;
  slug: string;
  category: string;
  level: string;
  duration: string;
};

export default function PurchasesPage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPurchases() {
      try {
        const response = await fetch("/api/student/purchases");

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load purchases");
        }

        setPurchases(data.data);
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load purchases",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
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
      <main style={{ padding: "40px" }}>
        <h1>Purchase History</h1>
        <p>Loading purchases...</p>
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
        }}
      >
        <div>
          <h1 style={{ marginBottom: "8px" }}>Purchase History</h1>

          <p style={{ color: "#666", margin: 0 }}>
            View your course purchases and enrollment records.
          </p>
        </div>

        <Link
          href="/student/dashboard"
          style={{
            textDecoration: "none",
            padding: "10px 16px",
            border: "1px solid #ddd",
            borderRadius: "6px",
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

      {!error && purchases.length === 0 && (
        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fafafa",
          }}
        >
          <h2>No purchases yet</h2>

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
          gap: "20px",
        }}
      >
        {purchases.map((purchase) => (
          <div
            key={`${purchase.id}-${purchase.item_id}`}
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
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 8px" }}>
                  {purchase.course_name}
                </h2>

                <p
                  style={{
                    margin: "4px 0",
                    color: "#666",
                  }}
                >
                  Purchase: {purchase.purchase_number}
                </p>

                <p
                  style={{
                    margin: "4px 0",
                    color: "#666",
                  }}
                >
                  Purchased on: {formatDate(purchase.created_at)}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  ₹{Number(purchase.total_price).toLocaleString("en-IN")}
                </div>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: "8px",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    background: "#f3f3f3",
                    fontSize: "13px",
                  }}
                >
                  {purchase.status}
                </span>
              </div>
            </div>

            <hr
              style={{
                margin: "20px 0",
                border: 0,
                borderTop: "1px solid #eee",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "15px",
                color: "#555",
              }}
            >
              <div>
                <strong>Category</strong>
                <div>{purchase.category}</div>
              </div>

              <div>
                <strong>Level</strong>
                <div>{purchase.level}</div>
              </div>

              <div>
                <strong>Duration</strong>
                <div>{purchase.duration}</div>
              </div>

              <div>
                <strong>Quantity</strong>
                <div>{purchase.quantity}</div>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <Link
                href={`/student/purchases/${purchase.purchase_number}`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "6px",
                }}
              >
                View Purchase
              </Link>

              <Link
                href={`/courses/${purchase.slug}`}
                style={{
                  display: "inline-block",
                  marginLeft: "10px",
                  padding: "10px 16px",
                  border: "1px solid #ddd",
                  color: "#333",
                  textDecoration: "none",
                  borderRadius: "6px",
                }}
              >
                View Course
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

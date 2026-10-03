import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>Course AI</h1>
      <p className="muted">Next.js + PostgreSQL + pgvector + OpenAI</p>
      <div className="grid">
        <Link className="card" href="/courses"><h2>Course Catalog</h2><p>Browse the 20 training courses.</p></Link>
        <div className="card"><h2>AI Assistant API</h2><p>POST /api/ai/chat to discover courses and create purchases.</p></div>
      </div>
    </main>
  );
}

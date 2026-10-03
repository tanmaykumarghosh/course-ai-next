import { NextResponse } from "next/server";
import { listCourses, courseEmbeddingDocument } from "@/lib/courses";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST() {
  try {
    const courses = await listCourses();
    for (const course of courses) {
      const embedding = await generateEmbedding(courseEmbeddingDocument(course));
      await db.query(`UPDATE courses SET embedding = $1::vector, updated_at = NOW() WHERE id = $2`, [`[${embedding.join(",")}]`, course.id]);
    }
    return NextResponse.json({ data: { indexed: courses.length } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "COURSE_INDEXING_FAILED", message: "Failed to index courses" }, { status: 500 });
  }
}

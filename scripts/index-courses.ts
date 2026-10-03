

import { listCourses, courseEmbeddingDocument } from "../lib/courses";
import { db } from "../lib/db";
import { generateEmbedding } from "../lib/embeddings";

async function main() {
  const courses = await listCourses();
  for (const course of courses) {
    const embedding = await generateEmbedding(courseEmbeddingDocument(course));
    await db.query(`UPDATE courses SET embedding = $1::vector, updated_at = NOW() WHERE id = $2`, [`[${embedding.join(",")}]`, course.id]);
    console.log(`Indexed: ${course.course_name}`);
  }
  await db.end();
}

main().catch((error) => { console.error(error); process.exit(1); });

import { db } from "./db";
import { generateEmbedding } from "./embeddings";

export async function getCourseBySlug(slug: string) {
  const result = await db.query(
    `SELECT id, course_name, slug, category, technology, level, duration,
            total_hours, fees, mode, language, certificate, live_projects,
            internship, job_assistance, prerequisites, syllabus, image, status,
            created_at, updated_at
     FROM courses WHERE slug = $1 AND status = 'Active' LIMIT 1`,
    [slug],
  );
  return result.rows[0] ?? null;
}

export async function listCourses() {
  const result = await db.query(
    `SELECT id, course_name, slug, category, technology, level, duration,
            total_hours, fees, mode, language, certificate, live_projects,
            internship, job_assistance, prerequisites, syllabus, image
     FROM courses
     WHERE status = 'Active'
     ORDER BY id`,
  );

  return result.rows;
}

export async function searchCourses(
  query: string,
  limit = 5,
) {
  const safeLimit = Math.min(
    Math.max(Math.trunc(limit), 1),
    10,
  );

  /*
   * First try direct catalog keyword matching.
   *
   * This is important for queries such as:
   * "is there any Python course?"
   * "do you have PHP?"
   * "React course"
   */
  const keywordResult = await db.query(
    `SELECT
       id,
       course_name,
       slug,
       category,
       technology,
       level,
       duration,
       total_hours,
       fees,
       mode,
       language,
       certificate,
       live_projects,
       internship,
       job_assistance,
       prerequisites,
       syllabus,
       image,
       status,
       1.0 AS similarity
     FROM courses
     WHERE status = 'Active'
       AND (
         course_name ILIKE '%' || $1 || '%'
         OR category ILIKE '%' || $1 || '%'
         OR technology ILIKE '%' || $1 || '%'
         OR prerequisites ILIKE '%' || $1 || '%'
       )
     ORDER BY id
     LIMIT $2`,
    [query, safeLimit],
  );

  if (keywordResult.rows.length > 0) {
    return keywordResult.rows.map((row) => ({
      score: 1,
      course: row,
    }));
  }

  /*
   * If direct keyword matching does not find anything,
   * fall back to semantic search.
   */
  const embedding = await generateEmbedding(query);

  const vector = `[${embedding.join(",")}]`;

  const result = await db.query(
    `SELECT
       id,
       course_name,
       slug,
       category,
       technology,
       level,
       duration,
       total_hours,
       fees,
       mode,
       language,
       certificate,
       live_projects,
       internship,
       job_assistance,
       prerequisites,
       syllabus,
       image,
       status,
       1 - (embedding <=> $1::vector) AS similarity
     FROM courses
     WHERE status = 'Active'
       AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [vector, safeLimit],
  );

  const minSimilarity = 0.60;

  return result.rows
    .filter(
      (row) =>
        Number(row.similarity) >=
        minSimilarity,
    )
    .map((row) => ({
      score: Number(row.similarity),
      course: row,
    }));
}

export function courseEmbeddingDocument(course: Record<string, unknown>) {
  return [
    `Course: ${course.course_name ?? ""}`,
    `Category: ${course.category ?? ""}`,
    `Technology: ${course.technology ?? ""}`,
    `Level: ${course.level ?? ""}`,
    `Duration: ${course.duration ?? ""}`,
    `Total Hours: ${course.total_hours ?? ""}`,
    `Mode: ${course.mode ?? ""}`,
    `Language: ${course.language ?? ""}`,
    `Certificate: ${course.certificate ? "Yes" : "No"}`,
    `Live Projects: ${course.live_projects ?? 0}`,
    `Internship: ${course.internship ? "Yes" : "No"}`,
    `Job Assistance: ${course.job_assistance ? "Yes" : "No"}`,
    `Prerequisites: ${course.prerequisites ?? ""}`,
  ].join("\n");
}

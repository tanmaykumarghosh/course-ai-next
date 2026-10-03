import "dotenv/config";
import { db } from "../lib/db";
import { generateEmbedding } from "../lib/embeddings";

async function main() {
  const query =
    process.argv.slice(2).join(" ") ||
    "I want to learn Python and Django";

  console.log(`\nSearch: "${query}"\n`);

  const embedding = await generateEmbedding(query);
  const vector = `[${embedding.join(",")}]`;

  const result = await db.query(
    `SELECT
       course_name,
       slug,
       category,
       technology,
       level,
       fees,
       1 - (embedding <=> $1::vector) AS similarity
     FROM courses
     WHERE status = 'Active'
       AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT 10`,
    [vector],
  );

  for (const row of result.rows) {
    console.log(
      `${Number(row.similarity).toFixed(4)} | ${row.course_name} | ${row.technology}`,
    );
  }

  await db.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
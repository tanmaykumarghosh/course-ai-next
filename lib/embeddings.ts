import { EMBEDDING_MODEL, openai } from "./openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: 1536,
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error("OpenAI returned no embedding");
  }

  return embedding;
}

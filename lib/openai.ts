import "dotenv/config";
import OpenAI from "openai";


if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not configured");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";
export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

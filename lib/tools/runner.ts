import { courseToolDefinitions } from "./definitions";
import {  listCourses,searchCourses, getCourseBySlug } from "../courses";
import { getPurchase } from "../purchases";
import { saveToolTrace } from "../traces";

export const toolRegistry = {
  search_courses: {
    riskLevel: "read",

    execute: async (args: {
      query: string;
      limit: number;
    }) => {
      return searchCourses(
        args.query,
        args.limit ?? 5,
      );
    },
  },

  list_courses: {
    riskLevel: "read",

    execute: async () => {
      return listCourses();
    },
  },

  get_course: {
    riskLevel: "read",

    execute: async (args: {
      slug: string;
    }) => {
      return getCourseBySlug(args.slug);
    },
  },
  
  get_purchase: {
    riskLevel: "read",
    execute: async (args: { purchaseNumber: string }) => getPurchase(args.purchaseNumber),
  },
  // create_purchase: {
  //   riskLevel: "write",
  //   execute: async (args: { studentName: string; studentEmail: string; studentPhone: string | null; courseSlug: string; idempotencyKey: string }) =>
  //     createPurchase({ ...args, studentPhone: args.studentPhone ?? undefined }),
  // },
};

export async function executeTool(
  name: string,
  argumentsJson: string,
  context?: { conversationId?: string; responseId?: string },
) {
  const startedAt = Date.now();
  const tool = toolRegistry[name as keyof typeof toolRegistry];
  if (!tool) throw new Error(`Tool execution not allowed: ${name}`);

  let args: unknown = {};
  try {
    args = JSON.parse(argumentsJson);
    const result = await tool.execute(args as never);
    await saveToolTrace({
      conversationId: context?.conversationId,
      responseId: context?.responseId,
      toolName: name,
      toolArguments: args,
      toolResult: result,
      status: "SUCCESS",
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    const result = error instanceof Error ? { message: error.message } : { message: String(error) };
    try {
      await saveToolTrace({
        conversationId: context?.conversationId,
        responseId: context?.responseId,
        toolName: name,
        toolArguments: args,
        toolResult: result,
        status: "ERROR",
        errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
        durationMs: Date.now() - startedAt,
      });
    } catch (traceError) {
      console.error("Failed to save tool trace", traceError);
    }
    throw error;
  }
}

export function listTools() {
  return courseToolDefinitions.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.parameters,
    riskLevel: tool.riskLevel,
  }));
}

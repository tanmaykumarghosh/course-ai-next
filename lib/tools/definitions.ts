export const courseToolDefinitions = [
  {
    type: "function" as const,
    name: "search_courses",
    description: "Search the active course catalog using natural language based on the student's learning goals, technology interests, level, duration, mode, and prerequisites.",
    riskLevel: "read" as const,
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language description of what the student wants to learn." },
        limit: { type: "integer", description: "Maximum number of courses to return." },
      },
      required: ["query", "limit"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function" as const,
    name: "get_course",
    description: "Get complete information about one active course using its slug.",
    riskLevel: "read" as const,
    parameters: {
      type: "object",
      properties: { slug: { type: "string", description: "Course slug such as ai-machine-learning." } },
      required: ["slug"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "list_courses",
    description:
      "List all active courses in the course catalog. Use this whenever the student asks to list all courses, show all courses, what courses are available, what courses are present, or asks for the complete course catalog.",
    riskLevel: "read",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
   {
    type: "function" as const,
    name: "create_purchase",
    description: "Create a course purchase only after the student explicitly asks to purchase or enroll. The backend reads the real course price and validates the course before writing the purchase.",
    riskLevel: "write" as const,
    parameters: {
      type: "object",
      properties: {
        studentName: { type: "string", description: "Student's full name." },
        studentEmail: { type: "string", description: "Student's email address." },
        studentPhone: { type: ["string", "null"], description: "Optional student phone number." },
        courseSlug: { type: "string", description: "Exact course slug." },
        idempotencyKey: { type: "string", description: "Unique key for this purchase attempt." },
      },
      required: ["studentName", "studentEmail", "studentPhone", "courseSlug", "idempotencyKey"],
      additionalProperties: false,
    },
    strict: true,
  },
] as const;

export const openAIToolDefinitions = courseToolDefinitions.map(({ riskLevel: _riskLevel, ...tool }) => tool);

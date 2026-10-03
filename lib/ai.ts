import { openai, OPENAI_MODEL } from "./openai";
import { openAIToolDefinitions } from "./tools/definitions";
import { executeTool } from "./tools/runner";
import { updateConversationResponse } from "./conversations";

const SYSTEM_INSTRUCTIONS = `
You are an AI course advisor for a technical training institute.

Your job is to help students discover courses from the course catalog.

Rules:

1. Use search_courses when the student asks about a particular
   technology, subject, category, or type of course.

2. Use list_courses whenever the student asks:
   - "what courses are present"
   - "what courses do you have"
   - "what courses are available"
   - "list all courses"
   - "show all courses"
   - "give me the complete course list"
   - "show the course catalog"
   - or otherwise asks for the complete catalog.

3. Do not use search_courses to answer a request for the
   complete course catalog.

4. Do not invent courses or course information.

5. Use get_course when the student asks for detailed information
   about a specific course.

6. Base course recommendations and course information only on
   actual tool results.

7. If search_courses finds matching courses, clearly present
   those courses.

8. If no suitable course is found, clearly say that no matching
   course was found.

9. If list_courses is used, present the complete returned course
   list.

10. Do not claim a course exists unless it was returned by a tool.

11. If the student explicitly asks to purchase or enroll in a
    course, identify the requested course and provide it as an
    enrollment option.

12. Never ask the student for their name, email address, or phone
    number. Student account information is handled by the
    application.

13. Never create purchases directly.

14. The frontend application handles authentication and purchase
    creation through the enrollment page.

15. Always use the actual course information returned by the
    course tools, including the actual course fee.

16. Keep responses clear and useful.
`;

type CourseResult = {
  id: number;
  course_name: string;
  slug: string;
  category?: string | null;
  technology?: string | null;
  level?: string | null;
  duration?: string | null;
  total_hours?: number | null;
  fees: string | number;
  mode?: string | null;
  language?: string | null;
  certificate?: boolean;
  live_projects?: number;
  internship?: boolean;
  job_assistance?: boolean;
  prerequisites?: string | null;
};

export async function runCourseAI(
  message: string,
  conversationId: string,
  previousResponseId?: string | null,
) {
  const courses: CourseResult[] = [];

  let response = await openai.responses.create({
    model: OPENAI_MODEL,

    instructions: SYSTEM_INSTRUCTIONS,

    input: message,

    ...(previousResponseId
      ? {
          previous_response_id:
            previousResponseId,
        }
      : {}),

    tools: openAIToolDefinitions,
  });

  for (let step = 0; step < 5; step++) {
    const functionCalls =
      response.output.filter(
        (item) =>
          item.type === "function_call",
      );

    /*
     * No more tools.
     *
     * Return the final response and all
     * courses collected from the tools.
     */
    if (functionCalls.length === 0) {
      await updateConversationResponse(
        conversationId,
        response.id,
      );

      const uniqueCourses =
        Array.from(
          new Map(
            courses.map((course) => [
              String(course.id),
              course,
            ]),
          ).values(),
        );

      console.log(
        "FINAL AI COURSES:",
        JSON.stringify(
          uniqueCourses,
          null,
          2,
        ),
      );

      return {
        responseId: response.id,

        text: response.output_text,

        courses: uniqueCourses,
      };
    }

    const toolOutputs = [];

    for (const call of functionCalls) {
      try {
        const result =
          await executeTool(
            call.name,
            call.arguments,
            {
              conversationId,
              responseId:
                response.id,
            },
          );

        /*
         * IMPORTANT DEBUG LOG
         */
        console.log(
          "AI TOOL NAME:",
          call.name,
        );

        console.log(
          "AI TOOL RESULT:",
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        /*
         * Extract courses.
         */
        if (
          call.name ===
            "search_courses" ||
          call.name ===
            "list_courses" ||
          call.name ===
            "get_course"
        ) {
          collectCourses(
            result,
            courses,
          );
        }

        /*
         * IMPORTANT DEBUG LOG
         */
        console.log(
          "COURSES COLLECTED SO FAR:",
          JSON.stringify(
            courses,
            null,
            2,
          ),
        );

        toolOutputs.push({
          type: "function_call_output" as const,

          call_id:
            call.call_id,

          output:
            JSON.stringify(
              result,
            ),
        });
      } catch (error) {
        console.error(
          "Tool execution error:",
          error,
        );

        toolOutputs.push({
          type: "function_call_output" as const,

          call_id:
            call.call_id,

          output:
            JSON.stringify({
              error:
                error instanceof
                Error
                  ? error.message
                  : String(
                      error,
                    ),
            }),
        });
      }
    }

    response =
      await openai.responses.create({
        model:
          OPENAI_MODEL,

        instructions:
          SYSTEM_INSTRUCTIONS,

        previous_response_id:
          response.id,

        input:
          toolOutputs,

        tools:
          openAIToolDefinitions,
      });
  }

  throw new Error(
    "AI tool-call loop exceeded maximum steps",
  );
}

/*
 * Extract course objects from any
 * reasonable tool-result structure.
 */
function collectCourses(
  result: unknown,
  courses: CourseResult[],
): void {
  if (!result) {
    return;
  }

  /*
   * Array
   */
  if (Array.isArray(result)) {
    for (const item of result) {
      collectCourses(
        item,
        courses,
      );
    }

    return;
  }

  /*
   * Object
   */
  if (
    typeof result !==
      "object" ||
    result === null
  ) {
    return;
  }

  const object =
    result as Record<
      string,
      unknown
    >;

  /*
   * Direct course
   */
  if (isCourse(object)) {
    courses.push(object);
  }

  /*
   * data
   *
   * {
   *   data: [...]
   * }
   *
   * or
   *
   * {
   *   data: {...}
   * }
   */
  if (
    object.data !==
    undefined
  ) {
    collectCourses(
      object.data,
      courses,
    );
  }

  /*
   * courses
   */
  if (
    object.courses !==
    undefined
  ) {
    collectCourses(
      object.courses,
      courses,
    );
  }

  /*
   * course
   */
  if (
    object.course !==
    undefined
  ) {
    collectCourses(
      object.course,
      courses,
    );
  }

  /*
   * result
   */
  if (
    object.result !==
    undefined
  ) {
    collectCourses(
      object.result,
      courses,
    );
  }

  /*
   * items
   */
  if (
    object.items !==
    undefined
  ) {
    collectCourses(
      object.items,
      courses,
    );
  }
}

/*
 * Determine whether an object
 * looks like a course.
 */
function isCourse(
  value: unknown,
): value is CourseResult {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const course =
    value as Record<
      string,
      unknown
    >;

  return (
    (
      typeof course.id ===
        "number" ||
      typeof course.id ===
        "string"
    ) &&
    typeof course.slug ===
      "string" &&
    typeof course.course_name ===
      "string"
  );
}
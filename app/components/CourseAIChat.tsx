"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Course = {
  id: number;
  course_name: string;
  slug: string;
  category?: string;
  technology?: string;
  level?: string;
  duration?: string;
  total_hours?: number;
  fees?: number | string;
  mode?: string;
  language?: string;
  certificate?: boolean;
  live_projects?: number;
  internship?: boolean;
  job_assistance?: boolean;
  prerequisites?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  courses?: Course[];
};

type ChatResponse = {
  success: boolean;

  data?: {
    conversationId: string;
    responseId: string;
    message: string;
    courses?: Course[];
  };

  error?: string;
};

type ConversationHistoryResponse = {
  success: boolean;

  data?: {
    conversationId: string;
    messages: Message[];
  };

  error?: string;
};

const STORAGE_CONVERSATION_ID =
  "course_ai_conversation_id";

const initialMessage: Message = {
  role: "assistant",
  content:
    "Hello! I’m your AI course advisor. What would you like to learn?",
};

export default function CourseAIChat() {
  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    initialMessage,
  ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  /*
   * Restore previous conversation
   */
  useEffect(() => {
    async function restoreConversation() {
      try {
        const savedConversationId =
          localStorage.getItem(
            STORAGE_CONVERSATION_ID,
          );

        if (!savedConversationId) {
          setHydrated(true);
          return;
        }

        setConversationId(
          savedConversationId,
        );

        const response = await fetch(
          `/api/ai/conversations?conversationId=${encodeURIComponent(
            savedConversationId,
          )}`,
        );

        if (!response.ok) {
          localStorage.removeItem(
            STORAGE_CONVERSATION_ID,
          );

          setConversationId(null);

          setMessages([
            initialMessage,
          ]);

          return;
        }

        const data: ConversationHistoryResponse =
          await response.json();

        if (
          data.success &&
          data.data &&
          Array.isArray(
            data.data.messages,
          )
        ) {
          setMessages(
            data.data.messages.map(
              (message) => ({
                role: message.role,
                content:
                  message.content,
                courses:
                  message.courses ?? [],
              }),
            ),
          );
        }
      } catch (error) {
        console.error(
          "Failed to restore conversation:",
          error,
        );
      } finally {
        setHydrated(true);
      }
    }

    restoreConversation();
  }, []);

  /*
   * Save conversation ID
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (conversationId) {
      localStorage.setItem(
        STORAGE_CONVERSATION_ID,
        conversationId,
      );
    } else {
      localStorage.removeItem(
        STORAGE_CONVERSATION_ID,
      );
    }
  }, [
    conversationId,
    hydrated,
  ]);

  /*
   * Send message to AI
   */
  async function sendMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    /*
     * Immediately show user's message
     */
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,

            ...(conversationId
              ? {
                  conversationId,
                }
              : {}),
          }),
        },
      );

      const data: ChatResponse =
        await response.json();

      /*
       * Check API response
       */
      if (
        !response.ok ||
        !data.success ||
        !data.data
      ) {
        throw new Error(
          data.error ||
            "Unable to get AI response",
        );
      }

      /*
       * Debug information
       */
      console.log(
        "AI CHAT RESPONSE:",
        data,
      );

      console.log(
        "AI COURSES:",
        data.data.courses,
      );

      /*
       * Save conversation ID
       */
      setConversationId(
        data.data.conversationId,
      );

      /*
       * Add assistant message
       *
       * IMPORTANT:
       * courses are stored together with
       * the assistant message.
       */
      setMessages((current) => [
        ...current,

        {
          role: "assistant",

          content:
            data.data!.message,

          courses:
            data.data!.courses ?? [],
        },
      ]);
    } catch (error) {
      console.error(
        "AI chat error:",
        error,
      );

      setMessages((current) => [
        ...current,

        {
          role: "assistant",

          content:
            error instanceof Error
              ? `Sorry, something went wrong: ${error.message}`
              : "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Start a completely new conversation
   */
  function startNewConversation() {
    localStorage.removeItem(
      STORAGE_CONVERSATION_ID,
    );

    setConversationId(null);

    setMessages([
      initialMessage,
    ]);

    setInput("");
  }

  /*
   * Format course price
   */
  function formatPrice(
    price?: string | number,
  ) {
    if (
      price === undefined ||
      price === null
    ) {
      return "Price unavailable";
    }

    return `₹${Number(
      price,
    ).toLocaleString("en-IN")}`;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      {/* =========================
          HEADER
      ========================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
            }}
          >
            AI Course Advisor
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#666",
            }}
          >
            Ask about courses,
            technologies,
            prerequisites,
            duration, fees,
            and more.
          </p>
        </div>

        <button
          type="button"
          onClick={
            startNewConversation
          }
          disabled={loading}
          style={{
            padding:
              "10px 16px",

            border:
              "1px solid #ccc",

            borderRadius: "6px",

            cursor: loading
              ? "not-allowed"
              : "pointer",

            whiteSpace:
              "nowrap",
          }}
        >
          New Chat
        </button>
      </div>

      {/* =========================
          CHAT CONTAINER
      ========================== */}

      <div
        style={{
          border:
            "1px solid #ddd",

          borderRadius: "10px",

          overflow: "hidden",

          background: "#fff",
        }}
      >
        {/* =========================
            MESSAGES
        ========================== */}

        <div
          style={{
            minHeight: "500px",

            maxHeight: "600px",

            overflowY: "auto",

            padding: "20px",

            background: "#f7f7f7",
          }}
        >
          {messages.map(
            (message, index) => (
              <div
                key={index}
                style={{
                  display: "flex",

                  justifyContent:
                    message.role ===
                    "user"
                      ? "flex-end"
                      : "flex-start",

                  marginBottom:
                    "16px",
                }}
              >
                {/* =========================
                    MESSAGE BUBBLE
                ========================== */}

                <div
                  style={{
                    maxWidth:
                      message.courses &&
                      message.courses
                        .length > 0
                        ? "90%"
                        : "75%",

                    padding:
                      "12px 16px",

                    borderRadius:
                      "10px",

                    background:
                      message.role ===
                      "user"
                        ? "#0070f3"
                        : "#fff",

                    color:
                      message.role ===
                      "user"
                        ? "#fff"
                        : "#222",

                    lineHeight:
                      "1.5",

                    boxShadow:
                      message.role ===
                      "assistant"
                        ? "0 1px 3px rgba(0,0,0,0.08)"
                        : "none",

                    width:
                      message.courses &&
                      message.courses
                        .length > 0
                        ? "100%"
                        : "auto",
                  }}
                >
                  {/* =========================
                      ASSISTANT MESSAGE
                  ========================== */}

                  {message.role ===
                  "assistant" ? (
                    <>
                      {/* AI TEXT */}

                      <ReactMarkdown
                        remarkPlugins={[
                          remarkGfm,
                        ]}
                        components={{
                          p: ({
                            children,
                          }) => (
                            <p
                              style={{
                                margin:
                                  "0 0 10px",

                                lineHeight:
                                  "1.6",
                              }}
                            >
                              {
                                children
                              }
                            </p>
                          ),

                          strong: ({
                            children,
                          }) => (
                            <strong>
                              {
                                children
                              }
                            </strong>
                          ),

                          ul: ({
                            children,
                          }) => (
                            <ul
                              style={{
                                paddingLeft:
                                  "22px",

                                margin:
                                  "8px 0",
                              }}
                            >
                              {
                                children
                              }
                            </ul>
                          ),

                          ol: ({
                            children,
                          }) => (
                            <ol
                              style={{
                                paddingLeft:
                                  "22px",

                                margin:
                                  "8px 0",
                              }}
                            >
                              {
                                children
                              }
                            </ol>
                          ),

                          li: ({
                            children,
                          }) => (
                            <li
                              style={{
                                marginBottom:
                                  "5px",

                                lineHeight:
                                  "1.5",
                              }}
                            >
                              {
                                children
                              }
                            </li>
                          ),

                          h1: ({
                            children,
                          }) => (
                            <h1
                              style={{
                                fontSize:
                                  "24px",

                                margin:
                                  "10px 0",
                              }}
                            >
                              {
                                children
                              }
                            </h1>
                          ),

                          h2: ({
                            children,
                          }) => (
                            <h2
                              style={{
                                fontSize:
                                  "21px",

                                margin:
                                  "10px 0",
                              }}
                            >
                              {
                                children
                              }
                            </h2>
                          ),

                          h3: ({
                            children,
                          }) => (
                            <h3
                              style={{
                                fontSize:
                                  "18px",

                                margin:
                                  "10px 0",
                              }}
                            >
                              {
                                children
                              }
                            </h3>
                          ),

                          code: ({
                            children,
                          }) => (
                            <code
                              style={{
                                background:
                                  "#f1f1f1",

                                padding:
                                  "2px 5px",

                                borderRadius:
                                  "4px",

                                fontSize:
                                  "0.9em",
                              }}
                            >
                              {
                                children
                              }
                            </code>
                          ),

                          a: ({
                            href,
                            children,
                          }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                textDecoration:
                                  "underline",
                              }}
                            >
                              {
                                children
                              }
                            </a>
                          ),
                        }}
                      >
                        {
                          message.content
                        }
                      </ReactMarkdown>

                      {/* =========================
                          COURSE CARDS
                      ========================== */}

                      {message.courses &&
                        message.courses
                          .length > 0 && (
                          <div
                            style={{
                              display:
                                "grid",

                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",

                              gap: "14px",

                              marginTop:
                                "16px",
                            }}
                          >
                            {message.courses.map(
                              (
                                course,
                              ) => (
                                <div
                                  key={
                                    course.id
                                  }
                                  style={{
                                    border:
                                      "1px solid #ddd",

                                    borderRadius:
                                      "10px",

                                    padding:
                                      "16px",

                                    background:
                                      "#fff",

                                    boxShadow:
                                      "0 1px 3px rgba(0,0,0,0.06)",
                                  }}
                                >
                                  {/* COURSE NAME */}

                                  <h3
                                    style={{
                                      margin:
                                        "0 0 12px",

                                      fontSize:
                                        "19px",

                                      color:
                                        "#222",
                                    }}
                                  >
                                    {
                                      course.course_name
                                    }
                                  </h3>

                                  {/* COURSE DETAILS */}

                                  <div
                                    style={{
                                      display:
                                        "grid",

                                      gap:
                                        "6px",

                                      color:
                                        "#555",

                                      fontSize:
                                        "14px",
                                    }}
                                  >
                                    {course.category && (
                                      <div>
                                        <strong>
                                          Category:
                                        </strong>{" "}
                                        {
                                          course.category
                                        }
                                      </div>
                                    )}

                                    {course.technology && (
                                      <div>
                                        <strong>
                                          Technology:
                                        </strong>{" "}
                                        {
                                          course.technology
                                        }
                                      </div>
                                    )}

                                    {course.level && (
                                      <div>
                                        <strong>
                                          Level:
                                        </strong>{" "}
                                        {
                                          course.level
                                        }
                                      </div>
                                    )}

                                    {course.duration && (
                                      <div>
                                        <strong>
                                          Duration:
                                        </strong>{" "}
                                        {
                                          course.duration
                                        }
                                      </div>
                                    )}

                                    {course.total_hours && (
                                      <div>
                                        <strong>
                                          Hours:
                                        </strong>{" "}
                                        {
                                          course.total_hours
                                        }
                                      </div>
                                    )}

                                    {course.mode && (
                                      <div>
                                        <strong>
                                          Mode:
                                        </strong>{" "}
                                        {
                                          course.mode
                                        }
                                      </div>
                                    )}

                                    {course.language && (
                                      <div>
                                        <strong>
                                          Language:
                                        </strong>{" "}
                                        {
                                          course.language
                                        }
                                      </div>
                                    )}

                                    <div>
                                      <strong>
                                        Fees:
                                      </strong>{" "}
                                      {formatPrice(
                                        course.fees,
                                      )}
                                    </div>

                                    {course.live_projects !==
                                      undefined && (
                                      <div>
                                        <strong>
                                          Live Projects:
                                        </strong>{" "}
                                        {
                                          course.live_projects
                                        }
                                      </div>
                                    )}

                                    {course.certificate !==
                                      undefined && (
                                      <div>
                                        <strong>
                                          Certificate:
                                        </strong>{" "}
                                        {course.certificate
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}

                                    {course.internship !==
                                      undefined && (
                                      <div>
                                        <strong>
                                          Internship:
                                        </strong>{" "}
                                        {course.internship
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}

                                    {course.job_assistance !==
                                      undefined && (
                                      <div>
                                        <strong>
                                          Job Assistance:
                                        </strong>{" "}
                                        {course.job_assistance
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}

                                    {course.prerequisites && (
                                      <div>
                                        <strong>
                                          Prerequisites:
                                        </strong>{" "}
                                        {
                                          course.prerequisites
                                        }
                                      </div>
                                    )}
                                  </div>

                                  {/* =========================
                                      ACTION BUTTONS
                                  ========================== */}

                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      gap:
                                        "10px",

                                      marginTop:
                                        "16px",

                                      flexWrap:
                                        "wrap",
                                    }}
                                  >
                                    <Link
                                      href={`/courses/${course.slug}`}
                                      style={{
                                        padding:
                                          "10px 16px",

                                        border:
                                          "1px solid #0070f3",

                                        borderRadius:
                                          "6px",

                                        color:
                                          "#0070f3",

                                        textDecoration:
                                          "none",

                                        fontWeight:
                                          500,
                                      }}
                                    >
                                      View Course
                                    </Link>

                                    <Link
                                      href={`/courses/${course.slug}/enroll`}
                                      style={{
                                        padding:
                                          "10px 16px",

                                        borderRadius:
                                          "6px",

                                        background:
                                          "#0070f3",

                                        color:
                                          "#fff",

                                        textDecoration:
                                          "none",

                                        fontWeight:
                                          600,
                                      }}
                                    >
                                      Enroll
                                    </Link>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </>
                  ) : (
                    /* =========================
                       USER MESSAGE
                    ========================== */

                    message.content
                  )}
                </div>
              </div>
            ),
          )}

          {/* =========================
              LOADING
          ========================== */}

          {loading && (
            <div
              style={{
                display: "flex",

                justifyContent:
                  "flex-start",
              }}
            >
              <div
                style={{
                  padding:
                    "12px 16px",

                  borderRadius:
                    "10px",

                  background: "#fff",

                  color: "#666",

                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* =========================
            INPUT FORM
        ========================== */}

        <form
          onSubmit={sendMessage}
          style={{
            display: "flex",

            gap: "10px",

            padding: "15px",

            borderTop:
              "1px solid #ddd",

            background: "#fff",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value,
              )
            }
            placeholder="Ask about our courses..."
            disabled={loading}
            style={{
              flex: 1,

              padding: "12px",

              border:
                "1px solid #ccc",

              borderRadius: "6px",

              fontSize: "16px",

              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
            style={{
              padding:
                "12px 22px",

              border: "none",

              borderRadius: "6px",

              background:
                loading ||
                !input.trim()
                  ? "#aaa"
                  : "#0070f3",

              color: "#fff",

              cursor:
                loading ||
                !input.trim()
                  ? "not-allowed"
                  : "pointer",

              fontSize: "16px",

              fontWeight: 500,
            }}
          >
            {loading
              ? "..."
              : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    technology TEXT,
    level VARCHAR(50),
    duration VARCHAR(100),
    total_hours INTEGER,
    fees NUMERIC(12,2) NOT NULL,
    mode VARCHAR(50),
    language VARCHAR(100),
    certificate BOOLEAN NOT NULL DEFAULT FALSE,
    live_projects INTEGER NOT NULL DEFAULT 0,
    internship BOOLEAN NOT NULL DEFAULT FALSE,
    job_assistance BOOLEAN NOT NULL DEFAULT FALSE,
    prerequisites TEXT,
    syllabus JSONB,
    image TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses(category);
CREATE INDEX IF NOT EXISTS courses_level_idx ON courses(level);

CREATE TABLE IF NOT EXISTS purchases (
    id BIGSERIAL PRIMARY KEY,
    purchase_number VARCHAR(50) UNIQUE NOT NULL,
    student_id BIGINT NOT NULL REFERENCES students(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    total_amount NUMERIC(12,2) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_id BIGINT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) UNIQUE NOT NULL,
    last_response_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tool_traces (
    id BIGSERIAL PRIMARY KEY,
    conversation_id VARCHAR(255),
    response_id VARCHAR(255),
    tool_name VARCHAR(255) NOT NULL,
    arguments JSONB,
    result JSONB,
    status VARCHAR(30) NOT NULL,
    error_code VARCHAR(100),
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this after the initial course import for larger catalogs.
-- CREATE INDEX courses_embedding_hnsw_idx
-- ON courses USING hnsw (embedding vector_cosine_ops);

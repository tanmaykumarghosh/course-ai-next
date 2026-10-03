# Course AI - Next.js + PostgreSQL + pgvector

Converted from the supplied Fastify/Qdrant AI order-copilot API into a Next.js App Router application.

## What changed

- Fastify -> Next.js App Router Route Handlers
- Qdrant -> PostgreSQL pgvector
- products -> courses
- customers -> students
- orders/order_items -> purchases/purchase_items
- product semantic search -> course semantic search
- inventory/customer-specific pricing removed because courses have catalog fees
- OpenAI Responses API tool loop retained
- conversation state and AI tool traces retained
- MCP-compatible tool listing/call endpoints retained

## Step 1: PostgreSQL

Create a database and user, then run:

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

Your PostgreSQL installation must have the `pgvector` extension installed.

## Step 2: environment

```bash
cp .env.example .env.local
```

Set `DATABASE_URL` and `OPENAI_API_KEY`.

## Step 3: install

```bash
npm install
```

## Step 4: seed the 20 courses

```bash
npm run seed
```

## Step 5: generate pgvector embeddings

```bash
npm run index:courses
```

This calls OpenAI embeddings once for each active course and stores the 1536-dimensional vector directly in PostgreSQL.

## Step 6: run Next.js

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## API

Health:

```text
GET /api/health
```

Course search:

```text
POST /api/courses/search
Content-Type: application/json

{"query":"I want to learn Python Django full stack development","limit":5}
```

AI chat:

```text
POST /api/ai/chat
Content-Type: application/json

{"message":"I want to learn AI and machine learning with Python and PyTorch","conversationId":"demo-1"}
```

Get course:

```text
GET /api/courses/ai-machine-learning
```

Create purchase directly:

```text
POST /api/purchases
Content-Type: application/json

{
  "studentName":"Madan",
  "studentEmail":"student@example.com",
  "studentPhone":"9999999999",
  "courseSlug":"ai-machine-learning",
  "idempotencyKey":"demo-purchase-001"
}
```

Get purchase:

```text
GET /api/purchases/PUR-1001
```

## AI purchase flow

1. Student describes a learning goal.
2. AI calls `search_courses`.
3. Next.js creates an embedding.
4. PostgreSQL pgvector returns the closest courses.
5. AI explains the matching courses.
6. Student explicitly asks to purchase/enroll.
7. AI calls `create_purchase`.
8. Backend reads the real course fee from PostgreSQL.
9. Purchase and purchase item are created transactionally.
10. Idempotency prevents duplicate purchases.

## Security note

Do not expose `OPENAI_API_KEY` to browser code. All OpenAI and PostgreSQL operations in this project run on the Next.js server.

## Next build steps

After the project starts successfully, build in this order:

1. PostgreSQL + pgvector verification
2. Seed courses
3. Course indexing
4. Test semantic search
5. Test AI chat/tool calling
6. Add student authentication
7. Add checkout/payment integration
8. Add enrollment records
9. Add student dashboard
10. Add production deployment

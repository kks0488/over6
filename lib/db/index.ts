let sql: typeof import("@vercel/postgres").sql | null = null

function isDBConfigured(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING)
}

async function getSQL() {
  if (!isDBConfigured()) return null
  if (!sql) {
    const mod = await import("@vercel/postgres")
    sql = mod.sql
  }
  return sql
}

export async function initDB() {
  const db = await getSQL()
  if (!db) return { skipped: true, reason: "POSTGRES_URL not configured" }

  await db`
    CREATE TABLE IF NOT EXISTS debates (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      effective_question TEXT,
      socrates_meta JSONB,
      philosophers JSONB NOT NULL,
      messages JSONB NOT NULL,
      sixth JSONB,
      report JSONB,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      title TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `
  await db`
    CREATE INDEX IF NOT EXISTS idx_debates_public ON debates (is_public, created_at DESC)
    WHERE is_public = TRUE
  `
  return { skipped: false }
}

export interface DBDebate {
  id: string
  question: string
  effective_question: string | null
  socrates_meta: unknown | null
  philosophers: unknown
  messages: unknown
  sixth: unknown | null
  report: unknown | null
  is_public: boolean
  title: string | null
  created_at: Date
}

export async function saveDebate(debate: {
  id: string
  question: string
  effectiveQuestion?: string | null
  socratesMeta?: unknown | null
  philosophers: unknown
  messages: unknown
  sixth?: unknown | null
  report?: unknown | null
  isPublic?: boolean
  title?: string | null
}): Promise<boolean> {
  const db = await getSQL()
  if (!db) return false

  await db`
    INSERT INTO debates (id, question, effective_question, socrates_meta, philosophers, messages, sixth, report, is_public, title)
    VALUES (
      ${debate.id},
      ${debate.question},
      ${debate.effectiveQuestion ?? null},
      ${debate.socratesMeta ? JSON.stringify(debate.socratesMeta) : null}::jsonb,
      ${JSON.stringify(debate.philosophers)}::jsonb,
      ${JSON.stringify(debate.messages)}::jsonb,
      ${debate.sixth ? JSON.stringify(debate.sixth) : null}::jsonb,
      ${debate.report ? JSON.stringify(debate.report) : null}::jsonb,
      ${debate.isPublic ?? false},
      ${debate.title ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      report = EXCLUDED.report,
      sixth = EXCLUDED.sixth,
      is_public = EXCLUDED.is_public,
      title = EXCLUDED.title
  `
  return true
}

export async function getDebate(id: string): Promise<DBDebate | null> {
  const db = await getSQL()
  if (!db) return null

  const { rows } = await db`SELECT * FROM debates WHERE id = ${id}`
  return (rows[0] as DBDebate) ?? null
}

export async function getPublicDebates(
  limit: number = 20,
  offset: number = 0
): Promise<DBDebate[]> {
  const db = await getSQL()
  if (!db) return []

  const { rows } = await db`
    SELECT * FROM debates
    WHERE is_public = TRUE
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return rows as DBDebate[]
}

export async function setDebatePublic(id: string, isPublic: boolean, title?: string): Promise<boolean> {
  const db = await getSQL()
  if (!db) return false

  if (title) {
    await db`
      UPDATE debates SET is_public = ${isPublic}, title = ${title} WHERE id = ${id}
    `
  } else {
    await db`
      UPDATE debates SET is_public = ${isPublic} WHERE id = ${id}
    `
  }
  return true
}

export { isDBConfigured }

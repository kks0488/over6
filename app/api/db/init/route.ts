import { initDB } from "@/lib/db"

export async function POST() {
  try {
    await initDB()
    return Response.json({ ok: true, message: "Database initialized" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}

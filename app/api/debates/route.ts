import { saveDebate, getPublicDebates, isDBConfigured } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  if (!isDBConfigured()) {
    return Response.json(
      { ok: false, error: "데이터베이스가 아직 연결되지 않았습니다." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()

    if (!body.id || !body.question || !body.philosophers || !body.messages) {
      return Response.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      )
    }

    const deleteToken = nanoid(32)

    await saveDebate({
      id: body.id,
      question: body.question,
      effectiveQuestion: body.effectiveQuestion ?? null,
      socratesMeta: body.socratesMeta ?? null,
      philosophers: body.philosophers,
      messages: body.messages,
      sixth: body.sixth ?? null,
      report: body.report ?? null,
      isPublic: body.isPublic ?? false,
      title: body.title ?? null,
      deleteToken,
    })

    return Response.json({ ok: true, id: body.id, deleteToken })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  if (!isDBConfigured()) {
    return Response.json({ debates: [], dbReady: false })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)
    const offset = parseInt(searchParams.get("offset") ?? "0")

    const debates = await getPublicDebates(limit, offset)

    return Response.json({
      debates: debates.map((d) => ({
        id: d.id,
        question: d.question,
        title: d.title,
        createdAt: d.created_at,
      })),
      dbReady: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}

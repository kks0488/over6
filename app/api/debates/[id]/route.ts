import { getDebate, setDebatePublic, isDBConfigured } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDBConfigured()) {
    return Response.json({ error: "데이터베이스가 아직 연결되지 않았습니다." }, { status: 503 })
  }

  try {
    const { id } = await params
    const debate = await getDebate(id)

    if (!debate) {
      return Response.json({ error: "토론을 찾을 수 없습니다." }, { status: 404 })
    }

    return Response.json(debate)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDBConfigured()) {
    return Response.json({ error: "데이터베이스가 아직 연결되지 않았습니다." }, { status: 503 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const debate = await getDebate(id)
    if (!debate) {
      return Response.json({ error: "토론을 찾을 수 없습니다." }, { status: 404 })
    }

    if (body.isPublic !== undefined) {
      await setDebatePublic(id, body.isPublic, body.title)
    }

    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}

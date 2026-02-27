import { runSixthAI } from "@/lib/ai/sixth-ai"
import type { DebateMessage, SocratesMeta } from "@/lib/types"

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, messages, socratesMeta } = body as {
      question: string
      messages: DebateMessage[]
      socratesMeta: SocratesMeta | null
    }

    if (!question || !messages?.length) {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 })
    }

    const sixthRebuttal = await runSixthAI(question, messages, socratesMeta)
    return Response.json(sixthRebuttal)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "제6의 AI 분석 중 오류가 발생했습니다."
    return Response.json({ error: message }, { status: 500 })
  }
}

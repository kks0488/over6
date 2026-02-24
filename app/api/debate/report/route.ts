import { generateReport } from "@/lib/ai/reporter"
import type { DebateMessage, SocratesMeta, SixthRebuttal } from "@/lib/types"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, messages, socratesMeta, sixthRebuttal, consensus, dissent } =
      body as {
        question: string
        messages: DebateMessage[]
        socratesMeta: SocratesMeta | null
        sixthRebuttal: SixthRebuttal
        consensus: string[]
        dissent: string[]
      }

    if (
      !question ||
      !messages?.length ||
      !sixthRebuttal ||
      !consensus ||
      !dissent
    ) {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 })
    }

    const report = await generateReport(
      question,
      messages,
      socratesMeta,
      sixthRebuttal,
      consensus,
      dissent
    )
    return Response.json(report)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "보고서 생성 중 오류가 발생했습니다."
    return Response.json({ error: message }, { status: 500 })
  }
}

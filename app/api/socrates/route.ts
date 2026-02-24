import { runSocratesAnalysis } from "@/lib/ai/socrates"
import { MAX_QUESTION_LENGTH } from "@/lib/constants"

export const maxDuration = 60

export async function POST(request: Request) {
  const body = await request.json()
  const question = body.question as string | undefined

  if (!question || question.trim().length === 0) {
    return Response.json({ error: "질문을 입력해주세요." }, { status: 400 })
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json(
      { error: `질문은 ${MAX_QUESTION_LENGTH}자 이하로 입력해주세요.` },
      { status: 400 }
    )
  }

  const analysis = await runSocratesAnalysis(question)

  return Response.json({
    framing: analysis.framing,
    assumptions: analysis.assumptions,
    biases: analysis.biases,
    options: analysis.options,
  })
}

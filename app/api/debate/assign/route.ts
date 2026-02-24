import { assignPhilosophers } from "@/lib/ai/assigner"
import { MAX_QUESTION_LENGTH } from "@/lib/constants"
import type { Philosopher, ClientPhilosopher, SocratesMeta } from "@/lib/types"

export const maxDuration = 60

function stripSystemPrompt(philosopher: Philosopher): ClientPhilosopher {
  const { systemPrompt: _, ...rest } = philosopher
  return rest
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, socratesMeta } = body as {
      question: string
      socratesMeta: SocratesMeta | null
    }

    if (!question || question.trim().length === 0) {
      return Response.json({ error: "질문을 입력해주세요." }, { status: 400 })
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return Response.json(
        { error: `질문은 ${MAX_QUESTION_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 }
      )
    }

    const effectiveQuestion = socratesMeta?.refinedQuestion || question
    const philosophers = await assignPhilosophers(effectiveQuestion, socratesMeta)

    // Return client-safe philosophers (without systemPrompt)
    const clientPhilosophers = philosophers.map(stripSystemPrompt)

    // Store the full philosopher data in a compact form for later rounds
    // We encode tradition + stance + color so the round endpoint can reconstruct systemPrompts
    const serverState = philosophers.map((p) => ({
      id: p.id,
      tradition: p.tradition,
      stance: p.stance,
      color: p.color,
    }))

    return Response.json({
      philosophers: clientPhilosophers,
      serverState,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "철학자 배정 중 오류가 발생했습니다."
    return Response.json({ error: message }, { status: 500 })
  }
}

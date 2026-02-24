import { chatCompletion, chatCompletionJSON } from "@/lib/ai/client"
import { TRADITIONS } from "@/lib/philosophers/traditions"
import { PERSONA_TEMPLATES } from "@/lib/philosophers/templates"
import { DEBATE_ROUNDS } from "@/lib/constants"
import type { DebateMessage, SocratesMeta, PhilosophyTradition } from "@/lib/types"
import { nanoid } from "nanoid"

export const maxDuration = 60

interface PhilosopherState {
  id: string
  tradition: PhilosophyTradition
  stance: string
  color: string
}

interface RoundRequest {
  question: string
  round: number
  serverState: PhilosopherState[]
  socratesMeta: SocratesMeta | null
  previousMessages: DebateMessage[]
  previousSummary: string | null
}

function reconstructSystemPrompt(
  state: PhilosopherState,
  socratesMeta: SocratesMeta | null
): string {
  const template = PERSONA_TEMPLATES[state.tradition]
  const socratesAddendum = socratesMeta
    ? `\n\n## 소크라테스 분석 참고
- 원래 질문에 숨겨진 전제: ${socratesMeta.assumptions.join("; ")}
- 발견된 인지 편향: ${socratesMeta.biases.map((b) => `${b.type}(${b.severity})`).join("; ")}
- 재구성된 질문: "${socratesMeta.refinedQuestion}"
이 분석을 참고하되, 네 고유한 철학적 관점으로 독립적으로 답변하라.`
    : ""

  return `${template.baseSystemPrompt}\n\n## 이번 토론 주제에 대한 너의 입장\n${state.stance}${socratesAddendum}`
}

function buildUserPrompt(
  question: string,
  round: number,
  previousMessages: DebateMessage[],
  previousSummary: string | null
): string {
  if (round === 1) {
    return `다음 질문에 대해 네 철학적 입장에서 독립적인 의견을 제시하라.

질문: "${question}"

이것은 첫 번째 발언이다. 다른 참여자의 의견을 참고하지 말고, 네 전통의 핵심 원리에 기반하여 논점을 제시하라.`
  } else if (round === 2) {
    const summarySection = previousSummary
      ? `## 이전 라운드 요약\n${previousSummary}\n\n`
      : ""
    const prevContext = previousMessages
      .map((m) => `[${m.speakerName}]: ${m.content}`)
      .join("\n\n")
    return `${summarySection}다음은 이전 라운드에서 다른 철학자들이 제시한 의견이다:

${prevContext}

이제 다른 철학자들의 논점을 직접 반박하라.
- 가장 반대되는 입장 1~2명을 지명하여 구체적으로 반박하라.
- 네 전통의 강점으로 상대의 약점을 공격하라.
- 새로운 논거를 추가하라.`
  } else {
    const summarySection = previousSummary
      ? `## 이전 라운드 요약\n${previousSummary}\n\n`
      : ""
    const prevContext = previousMessages
      .map((m) => `[${m.speakerName}] (${m.step}): ${m.content}`)
      .join("\n\n")
    return `${summarySection}다음은 지금까지의 전체 토론 내용이다:

${prevContext}

최종 라운드다. 다음을 수행하라:
1. 상대의 반박에 대해 재반박하라.
2. 합의할 수 있는 부분이 있다면 인정하되, 네 핵심 원칙은 포기하지 마라.
3. 네 입장의 가장 큰 약점이나 한계를 스스로 한 가지 인정하라. 자기 비판은 지적 정직성의 표현이다.
4. 이 논의에서 빠진 중요한 관점이 있다면 제시하라.
5. 최종 입장을 명확히 정리하라.`
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RoundRequest

    const {
      question,
      round,
      serverState,
      socratesMeta,
      previousMessages,
      previousSummary,
    } = body

    if (!question || round < 1 || round > DEBATE_ROUNDS || !serverState?.length) {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 })
    }

    const step = `round${round}` as "round1" | "round2" | "round3"
    const effectiveQuestion = socratesMeta?.refinedQuestion || question
    const userPrompt = buildUserPrompt(
      effectiveQuestion,
      round,
      previousMessages,
      previousSummary
    )

    // All 5 philosophers generate in parallel
    const messages = await Promise.all(
      serverState.map(async (state) => {
        const systemPrompt = reconstructSystemPrompt(state, socratesMeta)
        const def = TRADITIONS[state.tradition]
        const content = await chatCompletion(systemPrompt, userPrompt, {
          temperature: 0.85,
          maxTokens: 512,
        })
        return {
          id: nanoid(),
          step,
          speaker: state.id,
          speakerName: `${def.name} (${def.representative})`,
          tradition: state.tradition,
          content,
          round,
          color: state.color,
          timestamp: new Date().toISOString(),
        } as DebateMessage
      })
    )

    // Generate summary for next round (if not last round)
    let summary: string | null = null
    if (round < DEBATE_ROUNDS) {
      const allMessagesForSummary = [...previousMessages, ...messages]
      const context = allMessagesForSummary
        .filter((m) => m.round === round)
        .map((m) => `[${m.speakerName}]: ${m.content}`)
        .join("\n\n")

      const summarySystemPrompt = `너는 철학 토론의 요약 전문가다.
라운드 ${round}의 토론 내용을 간결하게 요약하라.
각 참여자의 핵심 논점과 주요 대립 구도를 정리하라.
200자 이내로 작성하라.`

      summary = await chatCompletion(summarySystemPrompt, context, {
        temperature: 0.5,
        maxTokens: 300,
      })
    }

    // Extract consensus & dissent after last round
    let consensus: string[] | null = null
    let dissent: string[] | null = null
    if (round === DEBATE_ROUNDS) {
      const allMessages = [...previousMessages, ...messages]
      const fullDebate = allMessages
        .map((m) => `[${m.speakerName}] (라운드 ${m.round}): ${m.content}`)
        .join("\n\n")

      const cdSystem = `너는 토론 분석가다.
전체 토론 내용을 분석하여 다음을 추출하라:
- consensus: 참여자들이 합의한 부분 또는 수렴한 관점 (1~3개)
- dissent: 끝까지 해결되지 않은 핵심 쟁점 또는 불일치 (2~4개)

각 항목은 한 문장으로 작성하라.

JSON 형식:
{
  "consensus": ["합의 사항1", "합의 사항2"],
  "dissent": ["쟁점1", "쟁점2"]
}`

      const cdResult = await chatCompletionJSON<{
        consensus: string[]
        dissent: string[]
      }>(cdSystem, fullDebate)
      consensus = cdResult.consensus
      dissent = cdResult.dissent
    }

    return Response.json({
      messages,
      summary,
      consensus,
      dissent,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "라운드 진행 중 오류가 발생했습니다."
    return Response.json({ error: message }, { status: 500 })
  }
}

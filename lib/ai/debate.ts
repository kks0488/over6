import { chatCompletion, chatCompletionJSON } from "@/lib/ai/client"
import type { Philosopher, DebateMessage } from "@/lib/types"
import { nanoid } from "nanoid"
import { DEBATE_ROUNDS } from "@/lib/constants"

interface DebateResult {
  messages: DebateMessage[]
  consensus: string[]
  dissent: string[]
}

interface ConsensusDissentResult {
  consensus: string[]
  dissent: string[]
}

type OnMessageCallback = (message: DebateMessage) => void

function createMessage(
  speaker: Philosopher,
  content: string,
  round: number,
  step: "round1" | "round2" | "round3"
): DebateMessage {
  return {
    id: nanoid(),
    step,
    speaker: speaker.id,
    speakerName: `${speaker.name} (${speaker.representative})`,
    tradition: speaker.tradition,
    content,
    round,
    color: speaker.color,
    timestamp: new Date().toISOString(),
  }
}

async function generateRoundMessages(
  philosophers: Philosopher[],
  question: string,
  previousMessages: DebateMessage[],
  round: number,
  onMessage: OnMessageCallback,
  previousSummary: string | null
): Promise<DebateMessage[]> {
  const step = `round${round}` as "round1" | "round2" | "round3"

  let userPrompt: string

  if (round === 1) {
    userPrompt = `다음 질문에 대해 네 철학적 입장에서 독립적인 의견을 제시하라.

질문: "${question}"

이것은 첫 번째 발언이다. 다른 참여자의 의견을 참고하지 말고, 네 전통의 핵심 원리에 기반하여 논점을 제시하라.`
  } else if (round === 2) {
    const summarySection = previousSummary
      ? `## 이전 라운드 요약\n${previousSummary}\n\n`
      : ""

    const prevContext = previousMessages
      .map((m) => `[${m.speakerName}]: ${m.content}`)
      .join("\n\n")

    userPrompt = `${summarySection}다음은 이전 라운드에서 다른 철학자들이 제시한 의견이다:

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

    userPrompt = `${summarySection}다음은 지금까지의 전체 토론 내용이다:

${prevContext}

최종 라운드다. 다음을 수행하라:
1. 상대의 반박에 대해 재반박하라.
2. 합의할 수 있는 부분이 있다면 인정하되, 네 핵심 원칙은 포기하지 마라.
3. 네 입장의 가장 큰 약점이나 한계를 스스로 한 가지 인정하라. 자기 비판은 지적 정직성의 표현이다.
4. 이 논의에서 빠진 중요한 관점이 있다면 제시하라.
5. 최종 입장을 명확히 정리하라.`
  }

  // All 5 philosophers generate in parallel
  const results = await Promise.all(
    philosophers.map(async (philosopher) => {
      const content = await chatCompletion(
        philosopher.systemPrompt,
        userPrompt,
        { temperature: 0.85, maxTokens: 512 }
      )
      const message = createMessage(philosopher, content, round, step)
      onMessage(message)
      return message
    })
  )

  return results
}

async function generateSummary(
  messages: DebateMessage[],
  round: number
): Promise<string> {
  const context = messages
    .filter((m) => m.round === round)
    .map((m) => `[${m.speakerName}]: ${m.content}`)
    .join("\n\n")

  const systemPrompt = `너는 철학 토론의 요약 전문가다.
라운드 ${round}의 토론 내용을 간결하게 요약하라.
각 참여자의 핵심 논점과 주요 대립 구도를 정리하라.
200자 이내로 작성하라.`

  return chatCompletion(systemPrompt, context, { temperature: 0.5, maxTokens: 300 })
}

async function extractConsensusAndDissent(
  allMessages: DebateMessage[]
): Promise<ConsensusDissentResult> {
  const fullDebate = allMessages
    .map((m) => `[${m.speakerName}] (라운드 ${m.round}): ${m.content}`)
    .join("\n\n")

  const systemPrompt = `너는 토론 분석가다.
전체 토론 내용을 분석하여 다음을 추출하라:
- consensus: 참여자들이 합의한 부분 또는 수렴한 관점 (1~3개)
- dissent: 끝까지 해결되지 않은 핵심 쟁점 또는 불일치 (2~4개)

각 항목은 한 문장으로 작성하라.

JSON 형식:
{
  "consensus": ["합의 사항1", "합의 사항2"],
  "dissent": ["쟁점1", "쟁점2"]
}`

  return chatCompletionJSON<ConsensusDissentResult>(systemPrompt, fullDebate)
}

export async function runDebate(
  question: string,
  philosophers: Philosopher[],
  onMessage: OnMessageCallback
): Promise<DebateResult> {
  const allMessages: DebateMessage[] = []
  let previousSummary: string | null = null

  for (let round = 1; round <= DEBATE_ROUNDS; round++) {
    // Generate messages for this round (5 philosophers in parallel)
    const roundMessages = await generateRoundMessages(
      philosophers,
      question,
      allMessages,
      round,
      onMessage,
      previousSummary
    )
    allMessages.push(...roundMessages)

    // Generate summary between rounds to feed into the next round
    if (round < DEBATE_ROUNDS) {
      previousSummary = await generateSummary(allMessages, round)
    }
  }

  // Extract consensus and dissent (1 JSON call)
  const { consensus, dissent } = await extractConsensusAndDissent(allMessages)

  return { messages: allMessages, consensus, dissent }
}

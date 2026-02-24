import { chatCompletionJSON } from "@/lib/ai/client"
import type {
  DebateMessage,
  SocratesMeta,
  SixthRebuttal,
  Report,
} from "@/lib/types"

interface ReportInsights {
  biasesFound: string[]
  thinkingQuestions: string[]
  missingPerspectives: string[]
  uncertaintyNote: string
}

async function generateInsights(
  question: string,
  messages: DebateMessage[],
  socratesMeta: SocratesMeta | null,
  sixthRebuttal: SixthRebuttal,
  consensus: string[],
  dissent: string[]
): Promise<ReportInsights> {
  const debateSummary = messages
    .map((m) => `[라운드 ${m.round}] ${m.speakerName}: ${m.content}`)
    .join("\n\n")

  const systemPrompt = `너는 토론 보고서 작성 전문가다.
전체 토론 과정을 분석하여 다음을 생성하라:

1. biasesFound: 이 토론 전체에서 발견된 사고 편향 3~5개
   - 토론자들의 편향뿐 아니라, 질문 자체와 토론 구조에 내재된 편향도 포함
   - 각 항목은 구체적 사례와 함께 한 문장으로

2. thinkingQuestions: 독자가 스스로 생각해볼 수 있는 후속 질문 3~5개
   - 토론에서 다루지 못한 각도를 포함
   - 실생활에 적용할 수 있는 구체적 질문
   - "이것이 정답이다"가 아닌 "이런 것도 생각해보라"의 톤

3. missingPerspectives: 이 토론에서 빠진 중요한 관점이나 전통 2~3개
   - 참여하지 않은 철학 전통 중 이 주제에 의미 있는 기여를 할 수 있었던 것
   - 각 항목은 왜 이 관점이 필요했는지 한 문장으로

4. uncertaintyNote: 이 보고서의 한계와 불확실성을 한 문단으로 솔직히 기술
   - AI 토론의 구조적 한계 (실제 인간 경험 부재, 맥락 축소 등)
   - 이 보고서가 확정적 결론이 아닌 사고의 출발점임을 명시

JSON 형식:
{
  "biasesFound": ["편향1", "편향2"],
  "thinkingQuestions": ["질문1", "질문2"],
  "missingPerspectives": ["빠진 관점1", "빠진 관점2"],
  "uncertaintyNote": "이 보고서의 한계..."
}`

  const socratesSection = socratesMeta
    ? `소크라테스 분석:
- 프레이밍: ${socratesMeta.framing.type}
- 숨겨진 전제: ${socratesMeta.assumptions.join("; ")}
- 인지 편향: ${socratesMeta.biases.map((b) => b.type).join(", ")}`
    : "소크라테스 분석: 비활성화"

  const userMessage = `## 원래 질문
"${question}"

## ${socratesSection}

## 토론 요약
${debateSummary}

## 합의 사항
${consensus.join("\n")}

## 미해결 쟁점
${dissent.join("\n")}

## 제6 AI의 분석
증거 반박: ${sixthRebuttal.evidenceRebuttal}
가설 역전: ${sixthRebuttal.hypothesisReversal}
편향 해체: ${sixthRebuttal.biasDeconstruction}
근본 질문: ${sixthRebuttal.fundamentalQuestion}`

  return chatCompletionJSON<ReportInsights>(systemPrompt, userMessage, {
    temperature: 0.6,
    maxTokens: 1024,
  })
}

export async function generateReport(
  question: string,
  messages: DebateMessage[],
  socratesMeta: SocratesMeta | null,
  sixthRebuttal: SixthRebuttal,
  consensus: string[],
  dissent: string[]
): Promise<Report> {
  const insights = await generateInsights(
    question,
    messages,
    socratesMeta,
    sixthRebuttal,
    consensus,
    dissent
  )

  return {
    originalQuestion: question,
    refinedQuestion: socratesMeta?.refinedQuestion ?? null,
    socratesMeta,
    consensus,
    dissent,
    sixthRebuttal,
    biasesFound: insights.biasesFound,
    thinkingQuestions: insights.thinkingQuestions,
    missingPerspectives: insights.missingPerspectives,
    uncertaintyNote: insights.uncertaintyNote,
    conclusion: "최종 판단은 당신의 몫입니다.",
  }
}

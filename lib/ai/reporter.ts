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

JSON 형식:
{
  "biasesFound": ["편향1", "편향2"],
  "thinkingQuestions": ["질문1", "질문2"]
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
    conclusion: "최종 판단은 당신의 몫입니다.",
  }
}

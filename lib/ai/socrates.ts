import { chatCompletionJSON } from "@/lib/ai/client"
import type { SocratesMeta } from "@/lib/types"

interface FramingResult {
  type: string
  description: string
  constrainedChoices: string[]
}

interface AssumptionsResult {
  assumptions: string[]
}

interface BiasResult {
  biases: {
    type: string
    severity: "low" | "medium" | "high"
    description: string
  }[]
}

interface ReframeResult {
  refinedQuestion: string
  explanation: string
}

async function analyzeFraming(question: string): Promise<FramingResult> {
  const systemPrompt = `너는 질문의 프레이밍을 분석하는 전문가다.
주어진 질문에서 다음을 분석하라:
1. 프레이밍 유형 (예: 이분법적 프레이밍, 감정적 프레이밍, 전제 포함 프레이밍, 유도 질문 등)
2. 프레이밍에 대한 설명
3. 질문이 제시하는 제한된 선택지 목록 (있다면)

JSON 형식:
{
  "type": "프레이밍 유형",
  "description": "프레이밍 설명",
  "constrainedChoices": ["선택지1", "선택지2"]
}`

  return chatCompletionJSON<FramingResult>(systemPrompt, `질문: "${question}"`)
}

async function extractAssumptions(question: string): Promise<string[]> {
  const systemPrompt = `너는 숨겨진 전제를 발견하는 전문가다.
주어진 질문에서 암묵적으로 전제하고 있는 가정들을 2~5개 찾아라.
질문자가 인식하지 못하는 숨겨진 전제에 집중하라.

JSON 형식:
{
  "assumptions": ["전제1", "전제2", "전제3"]
}`

  const result = await chatCompletionJSON<AssumptionsResult>(
    systemPrompt,
    `질문: "${question}"`
  )
  return result.assumptions
}

async function classifyBias(
  question: string,
  framing: FramingResult,
  assumptions: string[]
): Promise<BiasResult["biases"]> {
  const systemPrompt = `너는 인지 편향 분류 전문가다.
질문과 그 분석 결과를 바탕으로 질문에 내재된 인지 편향을 분류하라.

각 편향에 대해:
- type: 편향의 이름 (예: 확증 편향, 앵커링 효과, 매몰비용 오류, 현상유지 편향 등)
- severity: low / medium / high
- description: 이 질문에서 해당 편향이 어떻게 나타나는지 설명

JSON 형식:
{
  "biases": [
    { "type": "편향 이름", "severity": "medium", "description": "설명" }
  ]
}`

  const userMessage = `질문: "${question}"
프레이밍 분석: ${JSON.stringify(framing)}
숨겨진 전제: ${JSON.stringify(assumptions)}`

  const result = await chatCompletionJSON<BiasResult>(systemPrompt, userMessage)
  return result.biases
}

async function reframe(
  question: string,
  framing: FramingResult,
  assumptions: string[],
  biases: BiasResult["biases"]
): Promise<ReframeResult> {
  const systemPrompt = `너는 소크라테스적 질문 재구성 전문가다.
원래 질문의 프레이밍, 숨겨진 전제, 인지 편향을 모두 고려하여
더 열린, 편향이 줄어든 질문 하나를 제안하라.

재구성된 질문은:
- 이분법적 프레이밍을 해체할 것
- 숨겨진 전제를 드러낼 것
- 더 다양한 관점에서 사고할 수 있게 할 것
- 원래 질문의 핵심 관심사는 유지할 것

JSON 형식:
{
  "refinedQuestion": "재구성된 질문",
  "explanation": "왜 이렇게 재구성했는지 설명 (2~3문장)"
}`

  const userMessage = `원래 질문: "${question}"
프레이밍: ${JSON.stringify(framing)}
숨겨진 전제: ${JSON.stringify(assumptions)}
인지 편향: ${JSON.stringify(biases)}`

  return chatCompletionJSON<ReframeResult>(systemPrompt, userMessage)
}

export async function runSocrates(question: string): Promise<SocratesMeta> {
  // Step 1+2: Parallel — analyze framing and extract assumptions
  const [framing, assumptions] = await Promise.all([
    analyzeFraming(question),
    extractAssumptions(question),
  ])

  // Step 3: Classify biases (depends on framing + assumptions)
  const biases = await classifyBias(question, framing, assumptions)

  // Step 4: Reframe (depends on all previous)
  const reframeResult = await reframe(question, framing, assumptions, biases)

  return {
    framing,
    assumptions,
    biases,
    refinedQuestion: reframeResult.refinedQuestion,
    explanation: reframeResult.explanation,
  }
}

import { chatCompletionJSON } from "@/lib/ai/client"
import type { Philosopher, PhilosophyTradition, SocratesMeta } from "@/lib/types"
import { TRADITIONS, type TraditionDefinition } from "@/lib/philosophers/traditions"
import { findMaxDisagreementCombination } from "@/lib/philosophers/disagreement-matrix"
import { PERSONA_TEMPLATES } from "@/lib/philosophers/templates"
import { PHILOSOPHER_COLORS } from "@/lib/constants"

interface AgendaAnalysis {
  keywords: string[]
  domain: string
  coreDilemma: string
}

interface RelevanceScores {
  scores: Record<string, number>
}

interface PersonaStances {
  stances: Record<string, string>
}

async function analyzeAgenda(question: string): Promise<AgendaAnalysis> {
  const systemPrompt = `너는 토론 주제를 분석하는 전문가다.
주어진 질문에서 다음을 추출하라:
- keywords: 핵심 키워드 3~5개
- domain: 주제의 영역 (예: 윤리, 정치, 경제, 실존, 관계, 기술 등)
- coreDilemma: 이 질문이 내포한 핵심 딜레마를 한 문장으로

JSON 형식:
{
  "keywords": ["키워드1", "키워드2"],
  "domain": "영역",
  "coreDilemma": "핵심 딜레마"
}`

  return chatCompletionJSON<AgendaAnalysis>(systemPrompt, `질문: "${question}"`)
}

async function scoreRelevance(
  question: string,
  agenda: AgendaAnalysis,
  traditions: TraditionDefinition[]
): Promise<Record<PhilosophyTradition, number>> {
  const traditionList = traditions.map(
    (t) => `- ${t.id} (${t.name}): ${t.coreView} [키워드: ${t.keywords.join(", ")}]`
  ).join("\n")

  const systemPrompt = `너는 철학 전통의 관련성을 평가하는 전문가다.
주어진 질문과 분석을 바탕으로, 아래 12개 철학 전통 각각이 이 토론에 얼마나 관련 있는지 0~100 점수를 매겨라.

평가 기준:
- 해당 전통이 이 주제에 대해 독특하고 의미 있는 관점을 제시할 수 있는가?
- 해당 전통의 핵심 개념이 이 딜레마와 직접 연결되는가?
- 해당 전통이 다른 전통과 풍성한 대립 구도를 만들 수 있는가?

철학 전통 목록:
${traditionList}

JSON 형식:
{
  "scores": {
    "tradition_id": 점수,
    ...
  }
}`

  const userMessage = `질문: "${question}"
키워드: ${agenda.keywords.join(", ")}
영역: ${agenda.domain}
핵심 딜레마: ${agenda.coreDilemma}`

  const result = await chatCompletionJSON<RelevanceScores>(systemPrompt, userMessage)
  return result.scores as Record<PhilosophyTradition, number>
}

function filterTopTraditions(
  scores: Record<PhilosophyTradition, number>,
  count: number = 8
): PhilosophyTradition[] {
  return (Object.entries(scores) as [PhilosophyTradition, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([tradition]) => tradition)
}

async function generatePersonaStances(
  question: string,
  socratesMeta: SocratesMeta | null,
  traditions: PhilosophyTradition[]
): Promise<Record<PhilosophyTradition, string>> {
  const traditionInfo = traditions.map((t) => {
    const def = TRADITIONS[t]
    return `- ${t} (${def.name}, ${def.representative}): ${def.coreView}`
  }).join("\n")

  const socratesContext = socratesMeta
    ? `\n\n소크라테스 분석 결과:
- 재구성된 질문: "${socratesMeta.refinedQuestion}"
- 숨겨진 전제: ${socratesMeta.assumptions.join(", ")}
- 인지 편향: ${socratesMeta.biases.map((b) => b.type).join(", ")}`
    : ""

  const systemPrompt = `너는 철학 토론의 입장을 설정하는 전문가다.
각 철학 전통이 주어진 질문에 대해 취할 구체적 입장(stance)을 한 문장으로 생성하라.

입장 요건:
- 해당 전통의 핵심 원리에 충실할 것
- 이 특정 질문에 대한 구체적 답변 방향을 제시할 것
- 다른 전통과 대비되는 독특한 각도를 가질 것
- 한 문장, 50자 내외

참여 전통:
${traditionInfo}${socratesContext}

JSON 형식:
{
  "stances": {
    "tradition_id": "이 질문에 대한 구체적 입장",
    ...
  }
}`

  const result = await chatCompletionJSON<PersonaStances>(
    systemPrompt,
    `질문: "${question}"`
  )
  return result.stances as Record<PhilosophyTradition, string>
}

export async function assignPhilosophers(
  question: string,
  socratesMeta: SocratesMeta | null
): Promise<Philosopher[]> {
  // Step 1: Analyze the agenda (1 LLM call)
  const agenda = await analyzeAgenda(question)

  // Step 2: Score all 12 traditions (1 LLM call)
  const allTraditions = Object.values(TRADITIONS)
  const scores = await scoreRelevance(question, agenda, allTraditions)

  // Step 3: Filter top 7-8 (code only)
  const topTraditions = filterTopTraditions(scores, 8)

  // Step 4: Optimize combination for maximum disagreement (code only)
  const { traditions: selectedTraditions } = findMaxDisagreementCombination(
    topTraditions,
    5
  )

  // Step 5: Generate stances (1 LLM call)
  const stances = await generatePersonaStances(
    question,
    socratesMeta,
    selectedTraditions
  )

  // Assemble Philosopher objects
  return selectedTraditions.map((tradition, index): Philosopher => {
    const def = TRADITIONS[tradition]
    const template = PERSONA_TEMPLATES[tradition]

    const topicStance = stances[tradition] || def.coreView
    const socratesAddendum = socratesMeta
      ? `\n\n## 소크라테스 분석 참고
- 원래 질문에 숨겨진 전제: ${socratesMeta.assumptions.join("; ")}
- 발견된 인지 편향: ${socratesMeta.biases.map((b) => `${b.type}(${b.severity})`).join("; ")}
- 재구성된 질문: "${socratesMeta.refinedQuestion}"
이 분석을 참고하되, 네 고유한 철학적 관점으로 독립적으로 답변하라.`
      : ""

    const systemPrompt = `${template.baseSystemPrompt}

## 이번 토론 주제에 대한 너의 입장
${topicStance}${socratesAddendum}`

    return {
      id: `${tradition}-${Date.now()}`,
      tradition,
      name: def.name,
      representative: def.representative,
      stance: topicStance,
      color: PHILOSOPHER_COLORS[index] || "#6b7280",
      systemPrompt,
    }
  })
}

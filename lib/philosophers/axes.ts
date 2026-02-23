import type { TraditionDefinition } from "./traditions"

export interface AxisDefinition {
  id: keyof TraditionDefinition["axes"]
  name: string
  nameEn: string
  negative: string
  positive: string
  description: string
}

export const AXES: AxisDefinition[] = [
  {
    id: "resultVsPrinciple",
    name: "결과 vs 원칙",
    nameEn: "Result vs Principle",
    negative: "원칙 중심",
    positive: "결과 중심",
    description: "행위의 도덕성을 결과로 판단하는가, 아니면 행위 자체의 원칙으로 판단하는가",
  },
  {
    id: "individualVsCollective",
    name: "개인 vs 집단",
    nameEn: "Individual vs Collective",
    negative: "집단/관계 중심",
    positive: "개인/자율 중심",
    description: "개인의 자유와 자율성을 우선하는가, 아니면 공동체와 관계를 우선하는가",
  },
  {
    id: "realismVsIdealism",
    name: "현실 vs 이상",
    nameEn: "Realism vs Idealism",
    negative: "이상/초월 지향",
    positive: "현실/실증 지향",
    description: "현실적 조건과 실증에 기반하는가, 아니면 이상과 당위를 추구하는가",
  },
  {
    id: "certaintyVsDoubt",
    name: "확신 vs 의심",
    nameEn: "Certainty vs Doubt",
    negative: "의심/개방",
    positive: "확신/체계",
    description: "확고한 체계와 원리를 신뢰하는가, 아니면 끊임없는 의심과 열린 탐구를 지향하는가",
  },
]

const COVERAGE_THRESHOLD = 0.3

interface AxisCoverageResult {
  covered: boolean
  details: {
    axis: string
    hasPositive: boolean
    hasNegative: boolean
    positiveMax: number
    negativeMin: number
  }[]
  coveredCount: number
  totalAxes: number
}

/**
 * Check if a set of traditions covers all 4 philosophical axes.
 * Coverage means having at least one tradition with value > 0.3
 * and at least one with value < -0.3 on each axis.
 */
export function checkAxisCoverage(traditions: TraditionDefinition[]): AxisCoverageResult {
  const details = AXES.map((axis) => {
    const values = traditions.map((t) => t.axes[axis.id])
    const positiveMax = Math.max(...values)
    const negativeMin = Math.min(...values)

    return {
      axis: axis.name,
      hasPositive: positiveMax > COVERAGE_THRESHOLD,
      hasNegative: negativeMin < -COVERAGE_THRESHOLD,
      positiveMax,
      negativeMin,
    }
  })

  const coveredCount = details.filter((d) => d.hasPositive && d.hasNegative).length

  return {
    covered: coveredCount === AXES.length,
    details,
    coveredCount,
    totalAxes: AXES.length,
  }
}

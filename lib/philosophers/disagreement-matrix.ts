import type { PhilosophyTradition } from "@/lib/types"

/**
 * 12x12 Historical Disagreement Matrix
 *
 * Values range from 0 (agreement) to 1 (extreme opposition).
 * The matrix is symmetric: MATRIX[A][B] === MATRIX[B][A].
 *
 * Key historical rivalries:
 * - utilitarian <-> deontology = 0.9   (consequentialism vs duty, the foundational ethics divide)
 * - daoism <-> legalism = 0.9          (wu-wei vs rigid control, ancient Chinese antipodes)
 * - existentialism <-> legalism = 0.85 (radical freedom vs systemic coercion)
 * - buddhism <-> legalism = 0.75       (emptiness/non-attachment vs material incentives)
 * - skepticism <-> confucianism = 0.7  (doubt everything vs uphold received tradition)
 */
export const DISAGREEMENT_MATRIX: Record<PhilosophyTradition, Record<PhilosophyTradition, number>> = {
  utilitarian: {
    utilitarian: 0,
    deontology: 0.9,
    existentialism: 0.55,
    skepticism: 0.45,
    pragmatism: 0.2,
    social_contract: 0.4,
    confucianism: 0.5,
    daoism: 0.6,
    buddhism: 0.65,
    legalism: 0.35,
    critical_theory: 0.6,
    care_ethics: 0.55,
  },
  deontology: {
    utilitarian: 0.9,
    deontology: 0,
    existentialism: 0.6,
    skepticism: 0.7,
    pragmatism: 0.75,
    social_contract: 0.3,
    confucianism: 0.35,
    daoism: 0.65,
    buddhism: 0.5,
    legalism: 0.55,
    critical_theory: 0.5,
    care_ethics: 0.45,
  },
  existentialism: {
    utilitarian: 0.55,
    deontology: 0.6,
    existentialism: 0,
    skepticism: 0.3,
    pragmatism: 0.4,
    social_contract: 0.55,
    confucianism: 0.7,
    daoism: 0.35,
    buddhism: 0.4,
    legalism: 0.85,
    critical_theory: 0.35,
    care_ethics: 0.5,
  },
  skepticism: {
    utilitarian: 0.45,
    deontology: 0.7,
    existentialism: 0.3,
    skepticism: 0,
    pragmatism: 0.35,
    social_contract: 0.55,
    confucianism: 0.7,
    daoism: 0.45,
    buddhism: 0.35,
    legalism: 0.65,
    critical_theory: 0.3,
    care_ethics: 0.5,
  },
  pragmatism: {
    utilitarian: 0.2,
    deontology: 0.75,
    existentialism: 0.4,
    skepticism: 0.35,
    pragmatism: 0,
    social_contract: 0.35,
    confucianism: 0.45,
    daoism: 0.55,
    buddhism: 0.6,
    legalism: 0.3,
    critical_theory: 0.5,
    care_ethics: 0.4,
  },
  social_contract: {
    utilitarian: 0.4,
    deontology: 0.3,
    existentialism: 0.55,
    skepticism: 0.55,
    pragmatism: 0.35,
    social_contract: 0,
    confucianism: 0.45,
    daoism: 0.7,
    buddhism: 0.55,
    legalism: 0.5,
    critical_theory: 0.55,
    care_ethics: 0.4,
  },
  confucianism: {
    utilitarian: 0.5,
    deontology: 0.35,
    existentialism: 0.7,
    skepticism: 0.7,
    pragmatism: 0.45,
    social_contract: 0.45,
    confucianism: 0,
    daoism: 0.6,
    buddhism: 0.45,
    legalism: 0.55,
    critical_theory: 0.65,
    care_ethics: 0.4,
  },
  daoism: {
    utilitarian: 0.6,
    deontology: 0.65,
    existentialism: 0.35,
    skepticism: 0.45,
    pragmatism: 0.55,
    social_contract: 0.7,
    confucianism: 0.6,
    daoism: 0,
    buddhism: 0.3,
    legalism: 0.9,
    critical_theory: 0.5,
    care_ethics: 0.4,
  },
  buddhism: {
    utilitarian: 0.65,
    deontology: 0.5,
    existentialism: 0.4,
    skepticism: 0.35,
    pragmatism: 0.6,
    social_contract: 0.55,
    confucianism: 0.45,
    daoism: 0.3,
    buddhism: 0,
    legalism: 0.75,
    critical_theory: 0.45,
    care_ethics: 0.3,
  },
  legalism: {
    utilitarian: 0.35,
    deontology: 0.55,
    existentialism: 0.85,
    skepticism: 0.65,
    pragmatism: 0.3,
    social_contract: 0.5,
    confucianism: 0.55,
    daoism: 0.9,
    buddhism: 0.75,
    legalism: 0,
    critical_theory: 0.6,
    care_ethics: 0.75,
  },
  critical_theory: {
    utilitarian: 0.6,
    deontology: 0.5,
    existentialism: 0.35,
    skepticism: 0.3,
    pragmatism: 0.5,
    social_contract: 0.55,
    confucianism: 0.65,
    daoism: 0.5,
    buddhism: 0.45,
    legalism: 0.6,
    critical_theory: 0,
    care_ethics: 0.25,
  },
  care_ethics: {
    utilitarian: 0.55,
    deontology: 0.45,
    existentialism: 0.5,
    skepticism: 0.5,
    pragmatism: 0.4,
    social_contract: 0.4,
    confucianism: 0.4,
    daoism: 0.4,
    buddhism: 0.3,
    legalism: 0.75,
    critical_theory: 0.25,
    care_ethics: 0,
  },
}

/**
 * Generate all k-combinations from an array.
 */
export function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (k > arr.length) return []

  const results: T[][] = []

  function backtrack(start: number, current: T[]) {
    if (current.length === k) {
      results.push([...current])
      return
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i])
      backtrack(i + 1, current)
      current.pop()
    }
  }

  backtrack(0, [])
  return results
}

/**
 * Calculate the total disagreement score for a set of traditions.
 * Sum of all pairwise disagreement values in the combination.
 */
export function calculateDisagreementScore(traditions: PhilosophyTradition[]): number {
  let total = 0

  for (let i = 0; i < traditions.length; i++) {
    for (let j = i + 1; j < traditions.length; j++) {
      total += DISAGREEMENT_MATRIX[traditions[i]][traditions[j]]
    }
  }

  return total
}

/**
 * Find the combination of `selectCount` traditions from `candidates`
 * that maximizes total pairwise disagreement.
 *
 * For 5 from 8 candidates: C(8,5) = 56 combinations (fast).
 * For 5 from 12: C(12,5) = 792 combinations (still fast).
 */
export function findMaxDisagreementCombination(
  candidates: PhilosophyTradition[],
  selectCount: number = 5,
): { traditions: PhilosophyTradition[]; score: number } {
  const combinations = getCombinations(candidates, selectCount)

  let bestScore = -1
  let bestCombination: PhilosophyTradition[] = []

  for (const combo of combinations) {
    const score = calculateDisagreementScore(combo)
    if (score > bestScore) {
      bestScore = score
      bestCombination = combo
    }
  }

  return { traditions: bestCombination, score: bestScore }
}

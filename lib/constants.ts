export const MODELS = {
  default: process.env.OPENAI_MODEL || "gpt-5.2",
} as const

export const REASONING_EFFORT = {
  default: "high",
  sixth: "xhigh",
} as const

export const PHILOSOPHER_COLORS: Record<number, string> = {
  0: "#10b981", // emerald
  1: "#3b82f6", // blue
  2: "#f59e0b", // amber
  3: "#f43f5e", // rose
  4: "#8b5cf6", // violet
}

export const SIXTH_AI_COLOR = "#eab308"

export const DAILY_DEBATE_LIMIT = 3
export const MAX_QUESTION_LENGTH = 500
export const DEBATE_ROUNDS = 3

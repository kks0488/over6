export type PhilosophyTradition =
  | "utilitarian" | "deontology" | "existentialism" | "skepticism"
  | "pragmatism" | "social_contract" | "confucianism" | "daoism"
  | "buddhism" | "legalism" | "critical_theory" | "care_ethics"

export type DebateStep =
  | "idle" | "socrates" | "socrates_review" | "assign"
  | "round1" | "round2" | "round3"
  | "sixth" | "report" | "complete"

export interface SocratesMeta {
  framing: {
    type: string
    description: string
    constrainedChoices: string[]
  }
  assumptions: string[]
  biases: {
    type: string
    severity: "low" | "medium" | "high"
    description: string
  }[]
  refinedQuestion: string
  explanation: string
}

export interface SocratesOption {
  refinedQuestion: string
  style: "decisive" | "exploratory" | "experiential"
  styleLabel: string
  explanation: string
}

export interface SocratesAnalysisResult {
  framing: SocratesMeta["framing"]
  assumptions: string[]
  biases: SocratesMeta["biases"]
  options: SocratesOption[]
}

export interface Philosopher {
  id: string
  tradition: PhilosophyTradition
  name: string
  representative: string
  stance: string
  color: string
  systemPrompt: string
}

/** Philosopher shape sent to the client (systemPrompt stripped, coreView added) */
export type ClientPhilosopher = Omit<Philosopher, "systemPrompt"> & {
  coreView: string
  category: "western" | "eastern" | "modern"
}

export interface DebateMessage {
  id: string
  step: DebateStep
  speaker: string
  speakerName: string
  tradition?: PhilosophyTradition
  content: string
  round?: number
  color: string
  timestamp: string
}

export interface SixthRebuttal {
  evidenceRebuttal: string
  hypothesisReversal: string
  biasDeconstruction: string
  fundamentalQuestion: string
  mortalityLens: string
  fullText: string
}

export interface ReportConclusion {
  positions: {
    position: string
    strengths: string
    weaknesses: string
    uncertainty: string
  }[]
  unexploredDirections: string[]
  reflectionNote: string
}

export interface Report {
  originalQuestion: string
  refinedQuestion: string | null
  socratesMeta: SocratesMeta | null
  consensus: string[]
  dissent: string[]
  sixthRebuttal: SixthRebuttal
  biasesFound: string[]
  thinkingQuestions: string[]
  missingPerspectives: string[]
  uncertaintyNote: string
  conclusion: ReportConclusion | string
}

export interface DebateRecord {
  id: string
  question: string
  refinedQuestion: string | null
  socratesEnabled: boolean
  socratesMeta: SocratesMeta | null
  philosophers: ClientPhilosopher[]
  messages: DebateMessage[]
  sixthRebuttal: SixthRebuttal | null
  report: Report | null
  status: "running" | "completed" | "error"
  createdAt: string
}

export type SSEEventType =
  | "socrates" | "socrates_waiting" | "socrates_options" | "philosophers"
  | "message" | "sixth" | "report" | "progress" | "error" | "done"

export interface SSEEvent {
  type: SSEEventType
  data: unknown
}

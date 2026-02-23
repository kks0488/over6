import { create } from "zustand"
import type {
  DebateStep,
  SocratesMeta,
  ClientPhilosopher,
  DebateMessage,
  SixthRebuttal,
  Report,
} from "@/lib/types"

interface DebateState {
  debateId: string | null
  question: string
  socratesEnabled: boolean
  currentStep: DebateStep
  progress: number
  progressLabel: string
  socratesMeta: SocratesMeta | null
  refinedQuestion: string | null
  philosophers: ClientPhilosopher[]
  messages: DebateMessage[]
  sixthRebuttal: SixthRebuttal | null
  report: Report | null
  error: string | null
  isStreaming: boolean
}

interface DebateActions {
  startDebate: (debateId: string, question: string, socratesEnabled: boolean) => void
  setStep: (step: DebateStep) => void
  setProgress: (progress: number, label?: string) => void
  setSocratesMeta: (meta: SocratesMeta) => void
  setRefinedQuestion: (question: string) => void
  setPhilosophers: (philosophers: ClientPhilosopher[]) => void
  addMessage: (message: DebateMessage) => void
  setSixthRebuttal: (rebuttal: SixthRebuttal) => void
  setReport: (report: Report) => void
  setError: (error: string) => void
  setStreaming: (streaming: boolean) => void
  reset: () => void
}

const initialState: DebateState = {
  debateId: null,
  question: "",
  socratesEnabled: true,
  currentStep: "idle",
  progress: 0,
  progressLabel: "",
  socratesMeta: null,
  refinedQuestion: null,
  philosophers: [],
  messages: [],
  sixthRebuttal: null,
  report: null,
  error: null,
  isStreaming: false,
}

export const useDebateStore = create<DebateState & DebateActions>()((set) => ({
  ...initialState,

  startDebate: (debateId, question, socratesEnabled) =>
    set({
      ...initialState,
      debateId,
      question,
      socratesEnabled,
      currentStep: socratesEnabled ? "socrates" : "assign",
      isStreaming: true,
    }),

  setStep: (step) => set({ currentStep: step }),

  setProgress: (progress, label) =>
    set((state) => ({
      progress,
      progressLabel: label ?? state.progressLabel,
    })),

  setSocratesMeta: (meta) =>
    set({
      socratesMeta: meta,
      refinedQuestion: meta.refinedQuestion,
      currentStep: "assign",
    }),

  setRefinedQuestion: (question) => set({ refinedQuestion: question }),

  setPhilosophers: (philosophers) =>
    set({ philosophers, currentStep: "round1" }),

  addMessage: (message) =>
    set((state) => {
      const step = message.step || state.currentStep
      return {
        messages: [...state.messages, message],
        currentStep: step,
      }
    }),

  setSixthRebuttal: (rebuttal) =>
    set({ sixthRebuttal: rebuttal, currentStep: "report" }),

  setReport: (report) =>
    set({ report, currentStep: "complete" }),

  setError: (error) =>
    set({ error, isStreaming: false }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  reset: () => set(initialState),
}))

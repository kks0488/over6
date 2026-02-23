"use client"

import { useRef, useEffect, useMemo } from "react"
import type {
  DebateStep,
  SocratesMeta,
  ClientPhilosopher,
  DebateMessage as DebateMessageType,
  SixthRebuttal,
} from "@/lib/types"
import { SocratesResult } from "./socrates-result"
import { PhilosopherCards } from "./philosopher-cards"
import { DebateMessage } from "./debate-message"
import { SixthAICard } from "./sixth-ai-card"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface DebateTimelineProps {
  currentStep: DebateStep
  socratesEnabled: boolean
  socratesMeta: SocratesMeta | null
  philosophers: ClientPhilosopher[]
  messages: DebateMessageType[]
  sixthRebuttal: SixthRebuttal | null
  isStreaming: boolean
}

const STEP_ORDER: DebateStep[] = [
  "socrates",
  "assign",
  "round1",
  "round2",
  "round3",
  "sixth",
  "report",
  "complete",
]

function stepIndex(step: DebateStep): number {
  return STEP_ORDER.indexOf(step)
}

function isStepReached(currentStep: DebateStep, target: DebateStep): boolean {
  return stepIndex(currentStep) >= stepIndex(target)
}

function StepWaiting({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#1a1a1a] px-4 py-3">
      <Loader2 className="size-4 animate-spin text-indigo-400" />
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  )
}

export function DebateTimeline({
  currentStep,
  socratesEnabled,
  socratesMeta,
  philosophers,
  messages,
  sixthRebuttal,
  isStreaming,
}: DebateTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [currentStep, messages.length, sixthRebuttal])

  // Group messages by round
  const messagesByRound = useMemo(() => {
    const grouped: Record<number, DebateMessageType[]> = {}
    for (const msg of messages) {
      const round = msg.round ?? 1
      if (!grouped[round]) grouped[round] = []
      grouped[round].push(msg)
    }
    return grouped
  }, [messages])

  return (
    <div className="space-y-6">
      <AnimatePresence mode="sync">
        {/* Socrates Phase */}
        {socratesEnabled && (
          <motion.section
            key="socrates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {socratesMeta ? (
              <SocratesResult meta={socratesMeta} />
            ) : (
              isStreaming &&
              !isStepReached(currentStep, "assign") && (
                <StepWaiting label="소크라테스가 질문을 분석하고 있습니다..." />
              )
            )}
          </motion.section>
        )}

        {/* Philosopher Assignment */}
        {isStepReached(currentStep, "assign") && (
          <motion.section
            key="assign"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {philosophers.length > 0 ? (
              <PhilosopherCards philosophers={philosophers} />
            ) : (
              isStreaming && (
                <StepWaiting label="토론에 참여할 철학자를 배정하고 있습니다..." />
              )
            )}
          </motion.section>
        )}

        {/* Debate Rounds */}
        {isStepReached(currentStep, "round1") && (
          <motion.section
            key="rounds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {[1, 2, 3].map((round) => {
              const roundMessages = messagesByRound[round]
              if (!roundMessages && !isStepReached(currentStep, `round${round}` as DebateStep)) {
                return null
              }

              return (
                <div key={round} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <span className="text-xs font-medium text-zinc-500">
                      라운드 {round}
                    </span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </div>
                  {roundMessages ? (
                    <div className="space-y-3">
                      {roundMessages.map((msg, i) => (
                        <DebateMessage
                          key={msg.id}
                          message={msg}
                          index={i}
                        />
                      ))}
                    </div>
                  ) : (
                    isStreaming && (
                      <StepWaiting label={`라운드 ${round} 대기 중...`} />
                    )
                  )}
                </div>
              )
            })}
          </motion.section>
        )}

        {/* 6th AI */}
        {isStepReached(currentStep, "sixth") && (
          <motion.section
            key="sixth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs font-medium text-yellow-500/80">
                제6의 AI
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            {sixthRebuttal ? (
              <SixthAICard rebuttal={sixthRebuttal} />
            ) : (
              isStreaming && (
                <StepWaiting label="면벽자가 토론을 분석하고 있습니다..." />
              )
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}

"use client"

import type { SixthRebuttal } from "@/lib/types"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"
import { SIXTH_AI_COLOR } from "@/lib/constants"

interface SixthAICardProps {
  rebuttal: SixthRebuttal
}

const WEAPON_LABELS = [
  { key: "evidenceRebuttal" as const, label: "증거 반박", icon: "1" },
  { key: "hypothesisReversal" as const, label: "가설 전복", icon: "2" },
  { key: "biasDeconstruction" as const, label: "편향 해체", icon: "3" },
  { key: "fundamentalQuestion" as const, label: "근본 질문", icon: "4" },
]

export function SixthAICard({ rebuttal }: SixthAICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-lg border border-yellow-500/30 bg-[#1a1a1a]"
      style={{
        boxShadow: `0 0 30px ${SIXTH_AI_COLOR}15, 0 0 60px ${SIXTH_AI_COLOR}08`,
      }}
    >
      {/* Glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(ellipse at center, ${SIXTH_AI_COLOR}, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-yellow-500/20 p-4">
        <div
          className="flex size-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${SIXTH_AI_COLOR}20` }}
        >
          <Shield className="size-5" style={{ color: SIXTH_AI_COLOR }} />
        </div>
        <div>
          <h3
            className="text-base font-bold"
            style={{ color: SIXTH_AI_COLOR }}
          >
            제6의 AI -- 면벽자
          </h3>
          <p className="text-xs text-zinc-500">
            제도화된 반대자의 반박
          </p>
        </div>
      </div>

      {/* Weapons */}
      <div className="relative space-y-4 p-4">
        {WEAPON_LABELS.map(({ key, label, icon }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="flex size-5 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${SIXTH_AI_COLOR}20`,
                  color: SIXTH_AI_COLOR,
                }}
              >
                {icon}
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: SIXTH_AI_COLOR }}
              >
                {label}
              </span>
            </div>
            <p className="whitespace-pre-wrap pl-7 text-sm leading-relaxed text-zinc-300">
              {rebuttal[key]}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

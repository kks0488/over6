"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { SocratesOption, SocratesAnalysisResult } from "@/lib/types"
import { Zap, Compass, BookOpen, ArrowRight } from "lucide-react"

interface SocratesOptionsProps {
  analysis: SocratesAnalysisResult
  originalQuestion: string
  onSelect: (option: SocratesOption | null) => void
}

const STYLE_CONFIG = {
  decisive: {
    icon: Zap,
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/5",
    selectedBg: "bg-rose-500/15",
    label: "결단형",
    description: "핵심 딜레마를 선명하게",
  },
  exploratory: {
    icon: Compass,
    color: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/5",
    selectedBg: "bg-indigo-500/15",
    label: "탐구형",
    description: "전제를 해체하고 넓게 탐색",
  },
  experiential: {
    icon: BookOpen,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/5",
    selectedBg: "bg-emerald-500/15",
    label: "경험형",
    description: "구체적 상황으로 접근",
  },
} as const

export function SocratesOptions({
  analysis,
  originalQuestion,
  onSelect,
}: SocratesOptionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Analysis Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
          소크라테스 분석 결과
        </h3>
        <div className="rounded-lg bg-[#1a1a1a] p-4 space-y-3">
          <div>
            <p className="text-xs text-zinc-500">프레이밍</p>
            <p className="text-sm text-zinc-300">
              {analysis.framing.type} — {analysis.framing.description}
            </p>
          </div>
          {analysis.assumptions.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500">숨겨진 전제</p>
              <ul className="mt-1 space-y-1">
                {analysis.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-zinc-400">
                    · {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.biases.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500">인지 편향</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {analysis.biases.map((b, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400"
                  >
                    {b.type}
                    <span className="ml-1 text-amber-600">({b.severity})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          토론에 사용할 질문을 선택하세요
        </h3>

        {/* Original question option */}
        <button
          onClick={() => setSelectedIndex(-1)}
          className={`w-full rounded-lg border p-4 text-left transition-all ${
            selectedIndex === -1
              ? "border-zinc-400/50 bg-zinc-700/20"
              : "border-zinc-700/50 bg-[#1a1a1a] hover:border-zinc-600/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">원래 질문 그대로</span>
          </div>
          <p className="mt-1 text-sm text-zinc-200">{originalQuestion}</p>
        </button>

        {/* Reframed options */}
        {analysis.options.map((option, i) => {
          const style = STYLE_CONFIG[option.style] || STYLE_CONFIG.exploratory
          const Icon = style.icon
          const isSelected = selectedIndex === i

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedIndex(i)}
              className={`w-full rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? `${style.borderColor} ${style.selectedBg}`
                  : `border-zinc-700/50 ${style.bgColor} hover:${style.borderColor}`
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`size-4 ${style.color}`} />
                <span className={`text-xs font-medium ${style.color}`}>
                  {style.label}
                </span>
                <span className="text-xs text-zinc-600">
                  {style.description}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-200">
                {option.refinedQuestion}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {option.explanation}
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* Confirm button */}
      <div className="flex justify-end">
        <Button
          disabled={selectedIndex === null}
          onClick={() => {
            if (selectedIndex === null) return
            if (selectedIndex === -1) {
              onSelect(null) // use original question
            } else {
              onSelect(analysis.options[selectedIndex])
            }
          }}
          className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          이 질문으로 토론 시작
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </motion.div>
  )
}

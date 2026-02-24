"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { SocratesOption, SocratesAnalysisResult } from "@/lib/types"
import { Zap, Compass, BookOpen, ArrowRight, RotateCcw } from "lucide-react"

interface SocratesOptionsProps {
  analysis: SocratesAnalysisResult
  originalQuestion: string
  onSelect: (option: SocratesOption | null, finalQuestion?: string) => void
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
  const [editedQuestion, setEditedQuestion] = useState(originalQuestion)

  function handleSuggestionClick(index: number) {
    setSelectedIndex(index)
    setEditedQuestion(analysis.options[index].refinedQuestion)
  }

  function handleConfirm() {
    if (!editedQuestion.trim()) return

    if (selectedIndex === null || selectedIndex === -1) {
      onSelect(null, editedQuestion)
    } else {
      const option = analysis.options[selectedIndex]
      onSelect({ ...option, refinedQuestion: editedQuestion }, editedQuestion)
    }
  }

  const isModified = editedQuestion !== originalQuestion

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

      {/* Editable Question — Always Visible */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            토론에 사용할 질문
          </h3>
          {isModified && (
            <button
              onClick={() => {
                setEditedQuestion(originalQuestion)
                setSelectedIndex(null)
              }}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <RotateCcw className="size-3" />
              원래 질문으로
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          직접 수정하거나, 아래 제안을 클릭하여 질문을 변경하세요
        </p>
        <textarea
          value={editedQuestion}
          onChange={(e) => setEditedQuestion(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-indigo-500/30 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/60 resize-none"
          placeholder="토론에 사용할 질문을 입력하세요..."
        />
      </div>

      {/* Suggestion Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          소크라테스 질문 제안
        </h3>

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
              onClick={() => handleSuggestionClick(i)}
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
          disabled={!editedQuestion.trim()}
          onClick={handleConfirm}
          className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          이 질문으로 토론 시작
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </motion.div>
  )
}

"use client"

import { useState } from "react"
import type { SocratesMeta } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SocratesResultProps {
  meta: SocratesMeta
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  high: "bg-red-500/20 text-red-300 border-red-500/30",
}

export function SocratesResult({ meta }: SocratesResultProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-indigo-500/20 bg-[#1a1a1a]"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-300">
            소크라테스 분석 결과
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-4 text-zinc-500" />
        ) : (
          <ChevronDown className="size-4 text-zinc-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-zinc-800 px-4 pb-4 pt-4">
              {/* Framing */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  프레이밍 분석
                </p>
                <div className="rounded-md bg-zinc-900 p-3">
                  <p className="text-sm font-medium text-zinc-200">
                    {meta.framing.type}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {meta.framing.description}
                  </p>
                  {meta.framing.constrainedChoices.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {meta.framing.constrainedChoices.map((choice, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs text-zinc-400"
                        >
                          {choice}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Assumptions */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  숨겨진 전제
                </p>
                <ul className="space-y-1">
                  {meta.assumptions.map((assumption, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Biases */}
              {meta.biases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    인지 편향
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {meta.biases.map((bias, i) => (
                      <div
                        key={i}
                        className={`rounded-md border px-2.5 py-1.5 ${SEVERITY_COLORS[bias.severity]}`}
                      >
                        <p className="text-xs font-medium">{bias.type}</p>
                        <p className="mt-0.5 text-xs opacity-80">
                          {bias.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refined Question */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  정제된 질문
                </p>
                <div className="rounded-md border border-indigo-500/30 bg-indigo-500/10 p-3">
                  <p className="text-sm font-medium text-indigo-200">
                    {meta.refinedQuestion}
                  </p>
                </div>
                <p className="text-xs text-zinc-500">{meta.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

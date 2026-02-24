"use client"

import { useState } from "react"
import type { ClientPhilosopher } from "@/lib/types"
import { TRADITION_LABELS } from "@/lib/philosophers/tradition-labels"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Users, ChevronDown } from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  western: "서양",
  eastern: "동양",
  modern: "현대",
}

interface PhilosopherCardsProps {
  philosophers: ClientPhilosopher[]
}

function PhilosopherCard({ philosopher, index }: { philosopher: ClientPhilosopher; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      key={philosopher.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="rounded-lg border border-zinc-800 bg-[#1a1a1a] overflow-hidden cursor-pointer"
      style={{ borderLeftColor: philosopher.color, borderLeftWidth: 3 }}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Header - always visible */}
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-100">
              {philosopher.name}
            </p>
            <span className="text-xs text-zinc-600">
              {philosopher.representative}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: `${philosopher.color}20`,
                color: philosopher.color,
              }}
            >
              {TRADITION_LABELS[philosopher.tradition] || philosopher.tradition}
            </Badge>
            {philosopher.category && (
              <Badge variant="outline" className="text-xs text-zinc-500 border-zinc-700">
                {CATEGORY_LABELS[philosopher.category] || philosopher.category}
              </Badge>
            )}
          </div>
          {!expanded && (
            <p className="text-xs text-zinc-400 line-clamp-2">
              {philosopher.stance}
            </p>
          )}
        </div>
        <ChevronDown
          className={`mt-1 size-4 shrink-0 text-zinc-600 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-800 px-3 py-3 space-y-2">
              {philosopher.coreView && (
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">핵심 철학관</p>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {philosopher.coreView}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">이 토론에서의 입장</p>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {philosopher.stance}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function PhilosopherCards({ philosophers }: PhilosopherCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Users className="size-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-300">
          배정된 철학자 ({philosophers.length}명)
        </h3>
        <span className="text-xs text-zinc-600">카드를 눌러 상세 보기</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {philosophers.map((philosopher, index) => (
          <PhilosopherCard
            key={philosopher.id}
            philosopher={philosopher}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  )
}

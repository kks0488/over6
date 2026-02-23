"use client"

import { Check, X } from "lucide-react"
import { motion } from "framer-motion"

interface ConsensusSectionProps {
  consensus: string[]
  dissent: string[]
}

export function ConsensusSection({ consensus, dissent }: ConsensusSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Consensus */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
      >
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <Check className="size-4" />
          합의 지점
        </h4>
        {consensus.length > 0 ? (
          <ul className="space-y-2">
            {consensus.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">합의된 사항이 없습니다.</p>
        )}
      </motion.div>

      {/* Dissent */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4"
      >
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-400">
          <X className="size-4" />
          이견 지점
        </h4>
        {dissent.length > 0 ? (
          <ul className="space-y-2">
            {dissent.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <X className="mt-0.5 size-3.5 shrink-0 text-rose-500" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">이견이 없습니다.</p>
        )}
      </motion.div>
    </div>
  )
}

"use client"

import type { ClientPhilosopher } from "@/lib/types"
import { TRADITION_LABELS } from "@/lib/philosophers/tradition-labels"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Users } from "lucide-react"

interface PhilosopherCardsProps {
  philosophers: ClientPhilosopher[]
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
      </div>
      <div className="flex flex-wrap gap-3">
        {philosophers.map((philosopher, index) => (
          <motion.div
            key={philosopher.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex-1 min-w-[160px] max-w-[240px] rounded-lg border border-zinc-800 bg-[#1a1a1a] p-3"
            style={{ borderLeftColor: philosopher.color, borderLeftWidth: 3 }}
          >
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {philosopher.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {philosopher.representative}
                </p>
              </div>
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
              <p className="line-clamp-2 text-xs text-zinc-400">
                {philosopher.stance}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

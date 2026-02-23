"use client"

import type { DebateMessage as DebateMessageType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface DebateMessageProps {
  message: DebateMessageType
  index: number
}

const TRADITION_LABELS: Record<string, string> = {
  utilitarian: "공리주의",
  deontology: "의무론",
  existentialism: "실존주의",
  skepticism: "회의주의",
  pragmatism: "실용주의",
  social_contract: "사회계약론",
  confucianism: "유학",
  daoism: "도가",
  buddhism: "불교",
  legalism: "법가",
  critical_theory: "비판이론",
  care_ethics: "돌봄윤리",
}

export function DebateMessage({ message, index }: DebateMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-lg border border-zinc-800 bg-[#1a1a1a] p-4"
      style={{ borderLeftColor: message.color, borderLeftWidth: 3 }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="text-sm font-semibold"
          style={{ color: message.color }}
        >
          {message.speakerName}
        </span>
        {message.tradition && (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: `${message.color}15`,
              color: message.color,
            }}
          >
            {TRADITION_LABELS[message.tradition] || message.tradition}
          </Badge>
        )}
        {message.round && (
          <span className="ml-auto text-xs text-zinc-600">
            R{message.round}
          </span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
        {message.content}
      </p>
    </motion.div>
  )
}

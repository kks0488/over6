"use client"

import { motion } from "framer-motion"

interface ThinkingQuestionsProps {
  questions: string[]
}

export function ThinkingQuestions({ questions }: ThinkingQuestionsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-indigo-300">
        더 생각해볼 질문들
      </h4>
      <div className="space-y-3">
        {questions.map((question, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="rounded-lg bg-indigo-500/8 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-zinc-300" style={{ fontFamily: "'Noto Serif KR', serif, var(--font-sans)" }}>
                {question}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

"use client"

import { MessageSquare, Sparkles, Users, Shield, Brain } from "lucide-react"
import { motion } from "framer-motion"

const STEPS = [
  {
    icon: MessageSquare,
    number: "1",
    title: "질문",
    description: "당신의 질문이나 논쟁을 입력합니다",
    color: "#6366f1",
  },
  {
    icon: Sparkles,
    number: "2",
    title: "정제",
    description: "소크라테스 엔진이 숨겨진 전제를 분석합니다",
    color: "#8b5cf6",
  },
  {
    icon: Users,
    number: "3",
    title: "토론",
    description: "5명의 철학자가 3라운드 토론을 벌입니다",
    color: "#3b82f6",
  },
  {
    icon: Shield,
    number: "4",
    title: "반박",
    description: "제6의 AI가 합의를 정면으로 뒤집습니다",
    color: "#eab308",
  },
  {
    icon: Brain,
    number: "5",
    title: "판단",
    description: "종합 보고서를 바탕으로 당신이 결정합니다",
    color: "#10b981",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="text-2xl font-bold text-zinc-100">어떻게 작동하나요?</h2>
        <p className="mt-2 text-sm text-zinc-500">
          5단계 파이프라인이 당신의 사고를 확장합니다
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-5">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div
                className="mb-4 flex size-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <Icon className="size-6" style={{ color: step.color }} />
              </div>
              <div
                className="mb-2 flex size-6 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${step.color}20`,
                  color: step.color,
                }}
              >
                {step.number}
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {step.description}
              </p>

              {/* Connector line (not on last) */}
              {index < STEPS.length - 1 && (
                <div className="mt-4 hidden h-px w-full bg-zinc-800 md:block" />
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

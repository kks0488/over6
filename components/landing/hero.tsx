"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const EXAMPLE_TOPICS = [
  "연봉 vs 성장",
  "창업 vs 취업",
  "사형제도 존폐",
  "AI 직업 대체",
  "기본소득제",
]

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 size-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            Over<span className="text-indigo-400">6</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            제도화된 반대자 AI
          </p>
        </motion.div>

        {/* Main copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl font-medium leading-relaxed text-zinc-200 md:text-2xl"
        >
          다수의 합의가 틀릴 수 있다면,
          <br />
          당신에게는{" "}
          <span className="text-indigo-400">6번째 감각</span>이
          필요합니다.
        </motion.p>

        {/* Sub copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-400"
        >
          뤄지처럼 면벽하고, 아가사처럼 통찰하는 AI.
          <br />
          5명의 철학자가 토론하고, 6번째 AI가 반박하고, 당신이 결정합니다.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 px-8 text-base text-white hover:bg-indigo-500"
          >
            <Link href="/debate">
              토론 시작하기
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
          >
            <Link href="/community">
              커뮤니티 둘러보기
            </Link>
          </Button>
        </motion.div>

        {/* Example topics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-12 space-y-3"
        >
          <p className="text-xs text-zinc-600">인기 토론 주제</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_TOPICS.map((topic) => (
              <Link key={topic} href={`/debate?topic=${encodeURIComponent(topic)}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-colors hover:bg-indigo-500/20 hover:text-indigo-300"
                >
                  {topic}
                </Badge>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

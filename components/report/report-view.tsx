"use client"

import type { Report, SixthRebuttal } from "@/lib/types"
import { ConsensusSection } from "./consensus-section"
import { ThinkingQuestions } from "./thinking-questions"
import { SixthAICard } from "@/components/debate/sixth-ai-card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface ReportViewProps {
  report: Report
  sixthRebuttal: SixthRebuttal
  onNewDebate?: () => void
}

export function ReportView({
  report,
  sixthRebuttal,
  onNewDebate,
}: ReportViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl space-y-8"
    >
      {/* Questions Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-100">토론 요약</h3>
        <div className="space-y-3">
          <div className="rounded-lg bg-[#1a1a1a] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              원래 질문
            </p>
            <p className="mt-1 text-sm text-zinc-200">
              {report.originalQuestion}
            </p>
          </div>
          {report.refinedQuestion && (
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                정제된 질문
              </p>
              <p className="mt-1 text-sm text-indigo-200">
                {report.refinedQuestion}
              </p>
            </div>
          )}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Consensus & Dissent */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-100">합의와 이견</h3>
        <ConsensusSection
          consensus={report.consensus}
          dissent={report.dissent}
        />
      </section>

      <Separator className="bg-zinc-800" />

      {/* 6th AI */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-100">제6의 AI 반박</h3>
        <SixthAICard rebuttal={sixthRebuttal} />
      </section>

      <Separator className="bg-zinc-800" />

      {/* Biases Found */}
      {report.biasesFound.length > 0 && (
        <>
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">발견된 편향</h3>
            <ul className="space-y-2">
              {report.biasesFound.map((bias, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md bg-amber-500/5 p-3 text-sm text-zinc-300"
                >
                  <span className="mt-0.5 text-amber-400">&#8226;</span>
                  {bias}
                </li>
              ))}
            </ul>
          </section>
          <Separator className="bg-zinc-800" />
        </>
      )}

      {/* Thinking Questions */}
      {report.thinkingQuestions.length > 0 && (
        <>
          <section>
            <ThinkingQuestions questions={report.thinkingQuestions} />
          </section>
          <Separator className="bg-zinc-800" />
        </>
      )}

      {/* Conclusion */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-100">결론</h3>
        <div className="rounded-lg bg-[#1a1a1a] p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {report.conclusion}
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 pb-8">
        <Button variant="outline" asChild>
          <Link href="/debate/history">
            <ArrowLeft className="size-4" />
            전체 토론 보기
          </Link>
        </Button>
        {onNewDebate ? (
          <Button
            onClick={onNewDebate}
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <RotateCcw className="size-4" />
            새 토론 시작
          </Button>
        ) : (
          <Button
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Link href="/debate">
              <RotateCcw className="size-4" />
              새 토론 시작
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  )
}

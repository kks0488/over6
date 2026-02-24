"use client"

import { useState } from "react"
import type { Report } from "@/lib/types"
import { ConsensusSection } from "./consensus-section"
import { ThinkingQuestions } from "./thinking-questions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, RotateCcw, Share2, Check, Globe } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface ReportViewProps {
  report: Report
  debateId?: string
  onNewDebate?: () => void
  onShare?: () => Promise<void>
}

export function ReportView({
  report,
  debateId,
  onNewDebate,
  onShare,
}: ReportViewProps) {
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "shared" | "error">("idle")
  const [shareError, setShareError] = useState<string | null>(null)

  async function handleShare() {
    if (onShare) {
      setShareStatus("sharing")
      setShareError(null)
      try {
        await onShare()
        setShareStatus("shared")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "공유에 실패했습니다."
        setShareError(msg)
        setShareStatus("error")
        setTimeout(() => { setShareStatus("idle"); setShareError(null) }, 4000)
      }
    }
  }

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

      {/* Missing Perspectives */}
      {report.missingPerspectives && report.missingPerspectives.length > 0 && (
        <>
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">빠진 관점</h3>
            <ul className="space-y-2">
              {report.missingPerspectives.map((perspective, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md bg-violet-500/5 p-3 text-sm text-zinc-300"
                >
                  <span className="mt-0.5 text-violet-400">&#8226;</span>
                  {perspective}
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

      {/* Uncertainty Note */}
      {report.uncertaintyNote && (
        <>
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-100">보고서의 한계</h3>
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
              <p className="text-xs leading-relaxed text-zinc-400">
                {report.uncertaintyNote}
              </p>
            </div>
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-8">
        <Button variant="outline" asChild>
          <Link href="/debate/history">
            <ArrowLeft className="size-4" />
            전체 토론 보기
          </Link>
        </Button>
        <div className="flex gap-2">
          {onShare && (
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={shareStatus === "sharing" || shareStatus === "shared"}
                className={
                  shareStatus === "shared"
                    ? "border-emerald-500/30 text-emerald-400"
                    : shareStatus === "error"
                      ? "border-red-500/30 text-red-400"
                      : ""
                }
              >
                {shareStatus === "shared" ? (
                  <>
                    <Check className="size-4" />
                    커뮤니티에 공유됨
                  </>
                ) : shareStatus === "sharing" ? (
                  <>
                    <Globe className="size-4 animate-pulse" />
                    공유 중...
                  </>
                ) : shareStatus === "error" ? (
                  <>
                    <Share2 className="size-4" />
                    다시 시도
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    커뮤니티에 공유
                  </>
                )}
              </Button>
              {shareError && (
                <p className="text-xs text-red-400">{shareError}</p>
              )}
            </div>
          )}
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
      </div>
    </motion.div>
  )
}

"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useRef, Suspense } from "react"
import { useDebateStream } from "@/hooks/use-debate-stream"
import { useDebateHistory } from "@/hooks/use-debate-history"
import { ProgressBar } from "@/components/debate/progress-bar"
import { DebateTimeline } from "@/components/debate/debate-timeline"
import { ReportView } from "@/components/report/report-view"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { DebateRecord } from "@/lib/types"

function DebateStreamContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { saveDebate } = useDebateHistory()
  const hasSavedRef = useRef(false)

  const debateId = params.id as string
  const question = searchParams.get("question") ?? ""
  const socratesEnabled = searchParams.get("socrates") !== "false"

  const {
    currentStep,
    progress,
    progressLabel,
    socratesMeta,
    philosophers,
    messages,
    sixthRebuttal,
    report,
    error,
    isStreaming,
  } = useDebateStream({ debateId, question, socratesEnabled })

  // Save to history when complete
  useEffect(() => {
    if (report && !hasSavedRef.current) {
      hasSavedRef.current = true
      const record: DebateRecord = {
        id: debateId,
        question,
        refinedQuestion: socratesMeta?.refinedQuestion ?? null,
        socratesEnabled,
        socratesMeta,
        philosophers,
        messages,
        sixthRebuttal,
        report,
        status: "completed",
        createdAt: new Date().toISOString(),
      }
      saveDebate(record)
    }
  }, [
    report,
    debateId,
    question,
    socratesEnabled,
    socratesMeta,
    philosophers,
    messages,
    sixthRebuttal,
    saveDebate,
  ])

  // Save error state too — preserve accumulated data
  useEffect(() => {
    if (error && !hasSavedRef.current) {
      hasSavedRef.current = true
      const record: DebateRecord = {
        id: debateId,
        question,
        refinedQuestion: socratesMeta?.refinedQuestion ?? null,
        socratesEnabled,
        socratesMeta,
        philosophers,
        messages,
        sixthRebuttal,
        report: null,
        status: "error",
        createdAt: new Date().toISOString(),
      }
      saveDebate(record)
    }
  }, [error, debateId, question, socratesEnabled, socratesMeta, philosophers, messages, sixthRebuttal, saveDebate])

  if (!question) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-zinc-400">질문이 없습니다.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/debate">토론 시작하기</Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen px-4 pb-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl pt-6">
        <Link href="/" className="inline-block">
          <h1 className="text-xl font-extrabold tracking-tight">
            Over<span className="text-indigo-400">6</span>
          </h1>
        </Link>
      </div>

      {/* Sticky Progress Bar */}
      {currentStep !== "idle" && currentStep !== "complete" && (
        <div className="sticky top-0 z-50 -mx-4 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <ProgressBar
              currentStep={currentStep}
              progress={progress}
              label={progressLabel}
              socratesEnabled={socratesEnabled}
            />
          </div>
        </div>
      )}

      {/* Question display */}
      <div className="mx-auto mt-6 max-w-3xl">
        <div className="mb-6 rounded-lg bg-[#1a1a1a] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            토론 주제
          </p>
          <p className="mt-1 text-sm text-zinc-200">{question}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
              <div>
                <p className="font-medium text-red-300">오류가 발생했습니다</p>
                <p className="mt-1 text-sm text-red-400/80">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="size-3" />
                  다시 시도
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <DebateTimeline
          currentStep={currentStep}
          socratesEnabled={socratesEnabled}
          socratesMeta={socratesMeta}
          philosophers={philosophers}
          messages={messages}
          sixthRebuttal={sixthRebuttal}
          isStreaming={isStreaming}
        />

        {/* Report (inline when complete) */}
        {report && sixthRebuttal && (
          <div className="mt-8 border-t border-zinc-800 pt-8">
            <ReportView
              report={report}
              sixthRebuttal={sixthRebuttal}
              onNewDebate={() => router.push("/debate")}
            />
          </div>
        )}
      </div>
    </main>
  )
}

export default function DebateIdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-zinc-500">토론을 준비하고 있습니다...</p>
        </div>
      }
    >
      <DebateStreamContent />
    </Suspense>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback, Suspense } from "react"
import { nanoid } from "nanoid"
import { QuestionInput } from "@/components/debate/question-input"
import { SocratesOptions } from "@/components/debate/socrates-options"
import { useDebateHistory } from "@/hooks/use-debate-history"
import type { SocratesAnalysisResult, SocratesOption, SocratesMeta } from "@/lib/types"
import Link from "next/link"

type PagePhase = "input" | "analyzing" | "review" | "starting"

function DebatePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { canStartDebate, getRemainingCount, incrementDailyCount } =
    useDebateHistory()
  const [remainingCount, setRemainingCount] = useState(3)
  const [limitReached, setLimitReached] = useState(false)
  const [phase, setPhase] = useState<PagePhase>("input")
  const [pendingQuestion, setPendingQuestion] = useState("")
  const [socratesAnalysis, setSocratesAnalysis] = useState<SocratesAnalysisResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Pre-fill from topic query param
  const topicParam = searchParams.get("topic")

  useEffect(() => {
    setRemainingCount(getRemainingCount())
    setLimitReached(!canStartDebate())
  }, [canStartDebate, getRemainingCount])

  const startDebateWithParams = useCallback(
    (question: string, socratesMeta: SocratesMeta | null) => {
      incrementDailyCount()
      const debateId = nanoid(12)
      const params = new URLSearchParams({ question })

      if (socratesMeta) {
        params.set("socrates", "true")
        params.set("socratesMeta", encodeURIComponent(JSON.stringify(socratesMeta)))
      } else {
        params.set("socrates", "false")
      }

      router.push(`/debate/${debateId}?${params.toString()}`)
    },
    [incrementDailyCount, router]
  )

  async function handleSubmit(question: string, socratesEnabled: boolean) {
    if (!canStartDebate()) {
      setLimitReached(true)
      return
    }

    if (!socratesEnabled) {
      // Skip Socrates — go straight to debate
      startDebateWithParams(question, null)
      return
    }

    // Socrates 2-step: analyze first, then show options
    setPendingQuestion(question)
    setPhase("analyzing")
    setAnalyzeError(null)

    try {
      const res = await fetch("/api/socrates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "소크라테스 분석 실패")
      }

      const analysis = (await res.json()) as SocratesAnalysisResult
      setSocratesAnalysis(analysis)
      setPhase("review")
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "알 수 없는 오류")
      setPhase("input")
    }
  }

  function handleOptionSelect(option: SocratesOption | null, finalQuestion?: string) {
    if (!socratesAnalysis) return
    setPhase("starting")

    if (option === null) {
      // 원래 질문 사용 (수정됐을 수 있음)
      const question = finalQuestion || pendingQuestion
      startDebateWithParams(question, null)
    } else {
      const meta: SocratesMeta = {
        framing: socratesAnalysis.framing,
        assumptions: socratesAnalysis.assumptions,
        biases: socratesAnalysis.biases,
        refinedQuestion: option.refinedQuestion,
        explanation: option.explanation,
      }
      startDebateWithParams(pendingQuestion, meta)
    }
  }

  // Analyzing phase
  if (phase === "analyzing") {
    return (
      <main className="min-h-screen px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Over<span className="text-indigo-400">6</span>
            </h1>
          </Link>
        </div>
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 text-sm text-zinc-400">
            &ldquo;{pendingQuestion}&rdquo;
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="size-2 animate-pulse rounded-full bg-indigo-500" />
            <p className="text-sm text-zinc-400">
              소크라테스가 질문을 분석하고 있습니다...
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Review phase — show Socrates options
  if (phase === "review" && socratesAnalysis) {
    return (
      <main className="min-h-screen px-4 py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Over<span className="text-indigo-400">6</span>
            </h1>
          </Link>
          <p className="mt-2 text-sm text-zinc-500">
            소크라테스가 질문을 분석했습니다
          </p>
        </div>
        <SocratesOptions
          analysis={socratesAnalysis}
          originalQuestion={pendingQuestion}
          onSelect={handleOptionSelect}
        />
      </main>
    )
  }

  // Starting phase
  if (phase === "starting") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">토론을 시작합니다...</p>
      </main>
    )
  }

  // Input phase (default)
  return (
    <main className="min-h-screen px-4 py-16">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Over<span className="text-indigo-400">6</span>
          </h1>
        </Link>
        <p className="mt-2 text-sm text-zinc-500">
          토론할 주제를 입력하세요
        </p>
      </div>

      {analyzeError && (
        <div className="mx-auto mb-6 max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
          {analyzeError}
        </div>
      )}

      {limitReached ? (
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-6">
            <p className="text-lg font-semibold text-amber-300">
              오늘의 토론 횟수를 모두 사용했습니다
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              하루 최대 3회까지 토론할 수 있습니다. 내일 다시 시도해주세요.
            </p>
            <Link
              href="/debate/history"
              className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              이전 토론 보기 &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <QuestionInputWithTopic
          onSubmit={handleSubmit}
          remainingCount={remainingCount}
          initialTopic={topicParam}
        />
      )}
    </main>
  )
}

function QuestionInputWithTopic({
  onSubmit,
  remainingCount,
  initialTopic,
}: {
  onSubmit: (question: string, socratesEnabled: boolean) => void
  remainingCount: number
  initialTopic: string | null
}) {
  return (
    <QuestionInput
      key={initialTopic ?? "default"}
      onSubmit={onSubmit}
      remainingCount={remainingCount}
      defaultQuestion={initialTopic ?? ""}
    />
  )
}

export default function DebatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-zinc-500">로딩 중...</p>
        </div>
      }
    >
      <DebatePageContent />
    </Suspense>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { nanoid } from "nanoid"
import { QuestionInput } from "@/components/debate/question-input"
import { useDebateHistory } from "@/hooks/use-debate-history"
import Link from "next/link"

function DebatePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { canStartDebate, getRemainingCount, incrementDailyCount } =
    useDebateHistory()
  const [remainingCount, setRemainingCount] = useState(3)
  const [limitReached, setLimitReached] = useState(false)

  // Pre-fill from topic query param
  const topicParam = searchParams.get("topic")

  useEffect(() => {
    setRemainingCount(getRemainingCount())
    setLimitReached(!canStartDebate())
  }, [canStartDebate, getRemainingCount])

  function handleSubmit(question: string, socratesEnabled: boolean) {
    if (!canStartDebate()) {
      setLimitReached(true)
      return
    }

    incrementDailyCount()
    const debateId = nanoid(12)
    const params = new URLSearchParams({
      question,
      socrates: String(socratesEnabled),
    })
    router.push(`/debate/${debateId}?${params.toString()}`)
  }

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
  // If topic query param exists, we pass it through the component
  // QuestionInput manages its own state, so we use a key to reset it
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

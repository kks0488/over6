"use client"

import { useEffect, useState } from "react"
import { useDebateHistory } from "@/hooks/use-debate-history"
import type { DebateRecord } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

export default function HistoryPage() {
  const { getAllDebates } = useDebateHistory()
  const [debates, setDebates] = useState<DebateRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setDebates(getAllDebates())
    setLoaded(true)
  }, [getAllDebates])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="inline-block">
              <h1 className="text-xl font-extrabold tracking-tight">
                Over<span className="text-indigo-400">6</span>
              </h1>
            </Link>
            <p className="mt-1 text-sm text-zinc-500">토론 기록</p>
          </div>
          <Button
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Link href="/debate">새 토론</Link>
          </Button>
        </div>

        {/* Debate list */}
        {debates.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-[#1a1a1a] p-12 text-center">
            <MessageSquare className="mx-auto size-12 text-zinc-700" />
            <p className="mt-4 text-lg font-medium text-zinc-400">
              아직 토론 기록이 없습니다
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              첫 번째 토론을 시작해보세요
            </p>
            <Button
              asChild
              className="mt-6 bg-indigo-600 text-white hover:bg-indigo-500"
            >
              <Link href="/debate">
                토론 시작하기
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {debates.map((debate) => (
              <Link
                key={debate.id}
                href={
                  debate.status === "completed"
                    ? `/report/${debate.id}`
                    : `/debate/${debate.id}?question=${encodeURIComponent(debate.question)}&socrates=${debate.socratesEnabled}`
                }
                className="block"
              >
                <div className="group rounded-lg border border-zinc-800 bg-[#1a1a1a] p-4 transition-colors hover:border-indigo-500/30 hover:bg-[#1a1a1a]/80">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200 group-hover:text-indigo-300">
                        {debate.question}
                      </p>
                      {debate.refinedQuestion && (
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {debate.refinedQuestion}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {format(
                            new Date(debate.createdAt),
                            "yyyy.MM.dd HH:mm",
                            { locale: ko }
                          )}
                        </span>
                        <span>
                          철학자 {debate.philosophers.length}명
                        </span>
                        <span
                          className={
                            debate.status === "completed"
                              ? "text-emerald-500"
                              : debate.status === "error"
                                ? "text-red-400"
                                : "text-amber-400"
                          }
                        >
                          {debate.status === "completed"
                            ? "완료"
                            : debate.status === "error"
                              ? "오류"
                              : "진행 중"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

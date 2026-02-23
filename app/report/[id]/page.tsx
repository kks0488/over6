"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebateHistory } from "@/hooks/use-debate-history"
import { ReportView } from "@/components/report/report-view"
import { Button } from "@/components/ui/button"
import type { DebateRecord } from "@/lib/types"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function ReportPage() {
  const params = useParams()
  const debateId = params.id as string
  const { getDebate } = useDebateHistory()
  const [debate, setDebate] = useState<DebateRecord | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const record = getDebate(debateId)
    setDebate(record)
    setLoaded(true)
  }, [debateId, getDebate])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">로딩 중...</p>
      </div>
    )
  }

  if (!debate || !debate.report || !debate.sixthRebuttal) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <FileQuestion className="size-16 text-zinc-700" />
        <h2 className="mt-6 text-xl font-semibold text-zinc-300">
          리포트를 찾을 수 없습니다
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          이 토론 기록이 존재하지 않거나 아직 완료되지 않았습니다.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/debate/history">토론 기록</Link>
          </Button>
          <Button
            asChild
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Link href="/debate">새 토론 시작</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-16">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-3xl">
        <Link href="/" className="inline-block">
          <h1 className="text-xl font-extrabold tracking-tight">
            Over<span className="text-indigo-400">6</span>
          </h1>
        </Link>
        <p className="mt-1 text-sm text-zinc-500">토론 리포트</p>
      </div>

      <ReportView
        report={debate.report}
        sixthRebuttal={debate.sixthRebuttal}
      />
    </main>
  )
}

"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ReportView } from "@/components/report/report-view"
import { DebateTimeline } from "@/components/debate/debate-timeline"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Report, SixthRebuttal, SocratesMeta, ClientPhilosopher, DebateMessage } from "@/lib/types"

interface DebateData {
  id: string
  question: string
  effective_question: string | null
  socrates_meta: SocratesMeta | null
  philosophers: ClientPhilosopher[]
  messages: DebateMessage[]
  sixth: SixthRebuttal | null
  report: Report | null
  title: string | null
  created_at: string
}

export default function CommunityDebateDetail() {
  const params = useParams()
  const id = params.id as string
  const [debate, setDebate] = useState<DebateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/debates/${id}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error("토론을 찾을 수 없습니다.")
          if (res.status === 503) throw new Error("커뮤니티 기능 준비 중입니다. 곧 이용 가능합니다.")
          throw new Error("불러오기 실패")
        }
        const data = await res.json()
        setDebate(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">토론을 불러오는 중...</p>
      </div>
    )
  }

  if (error || !debate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/community">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen px-4 pb-16">
      <div className="mx-auto max-w-3xl pt-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-extrabold tracking-tight">
              Over<span className="text-indigo-400">6</span>
            </h1>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/community">
              <ArrowLeft className="size-3" />
              목록
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        {/* Title & Question */}
        <div className="mb-6 space-y-3">
          {debate.title && (
            <h2 className="text-xl font-bold text-zinc-100">{debate.title}</h2>
          )}
          <div className="rounded-lg bg-[#1a1a1a] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              토론 주제
            </p>
            <p className="mt-1 text-sm text-zinc-200">{debate.question}</p>
          </div>
        </div>

        {/* Timeline */}
        <DebateTimeline
          currentStep="complete"
          socratesEnabled={!!debate.socrates_meta}
          socratesMeta={debate.socrates_meta}
          philosophers={debate.philosophers}
          messages={debate.messages}
          sixthRebuttal={debate.sixth}
          isStreaming={false}
        />

        {/* Report */}
        {debate.report && debate.sixth && (
          <div className="mt-8 border-t border-zinc-800 pt-8">
            <ReportView
              report={debate.report}
              debateId={debate.id}
            />
          </div>
        )}
      </div>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"

interface CommunityDebate {
  id: string
  question: string
  title: string | null
  createdAt: string
}

export default function CommunityPage() {
  const [debates, setDebates] = useState<CommunityDebate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/debates?limit=30")
        if (!res.ok) throw new Error("Failed to load")
        const data = await res.json()
        setDebates(data.debates)
      } catch {
        setError("토론 목록을 불러올 수 없습니다.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="min-h-screen px-4 py-16">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Over<span className="text-indigo-400">6</span>
              </h1>
            </Link>
            <p className="mt-2 text-sm text-zinc-500">
              다른 사람들은 어떤 질문을 던졌을까?
            </p>
          </div>
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-500">
            <Link href="/debate">
              <MessageSquare className="size-4" />
              나도 토론하기
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="size-2 animate-pulse rounded-full bg-indigo-500" />
            <p className="ml-3 text-sm text-zinc-500">토론 목록을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && debates.length === 0 && (
          <div className="rounded-lg bg-[#1a1a1a] p-12 text-center">
            <MessageSquare className="mx-auto size-8 text-zinc-600" />
            <p className="mt-4 text-sm text-zinc-500">
              아직 공유된 토론이 없습니다.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              토론을 완료한 후 &ldquo;커뮤니티에 공유&rdquo; 버튼을 눌러보세요.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {debates.map((debate, i) => (
            <motion.div
              key={debate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/community/${debate.id}`}
                className="group block rounded-lg border border-zinc-800 bg-[#1a1a1a] p-5 transition-all hover:border-indigo-500/30 hover:bg-[#1f1f1f]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300">
                      {debate.title || debate.question}
                    </h3>
                    {debate.title && (
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {debate.question}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-xs text-zinc-600">
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(debate.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-indigo-400" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}

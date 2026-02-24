"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, ArrowRight, Trash2 } from "lucide-react"
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
  const [dbReady, setDbReady] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/debates?limit=30")
        if (!res.ok) throw new Error("Failed to load")
        const data = await res.json()
        setDebates(data.debates ?? [])
        if (data.dbReady === false) setDbReady(false)
      } catch {
        setError("토론 목록을 불러올 수 없습니다.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function hasDeleteToken(debateId: string): boolean {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(`over6-del-${debateId}`)
  }

  const handleDelete = useCallback(async (debateId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem(`over6-del-${debateId}`)
    if (!token) return

    if (!confirm("이 토론을 커뮤니티에서 삭제하시겠습니까?")) return

    setDeletingId(debateId)
    try {
      const res = await fetch(`/api/debates/${debateId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteToken: token }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "삭제에 실패했습니다.")
        return
      }
      localStorage.removeItem(`over6-del-${debateId}`)
      setDebates((prev) => prev.filter((d) => d.id !== debateId))
    } catch {
      alert("삭제 중 오류가 발생했습니다.")
    } finally {
      setDeletingId(null)
    }
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
              {dbReady
                ? "아직 공유된 토론이 없습니다."
                : "커뮤니티 기능 준비 중입니다."}
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {dbReady
                ? '토론을 완료한 후 "커뮤니티에 공유" 버튼을 눌러보세요.'
                : "곧 다른 사람들의 토론을 볼 수 있게 됩니다."}
            </p>
            <Link
              href="/debate"
              className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              토론 시작하기 &rarr;
            </Link>
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
                  <div className="flex items-center gap-2">
                    {hasDeleteToken(debate.id) && (
                      <button
                        onClick={(e) => handleDelete(debate.id, e)}
                        disabled={deletingId === debate.id}
                        className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="삭제"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                    <ArrowRight className="mt-1 size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-indigo-400" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}

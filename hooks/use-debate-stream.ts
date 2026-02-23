"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDebateStore } from "@/stores/debate-store"
import type {
  SocratesMeta,
  ClientPhilosopher,
  DebateMessage,
  SixthRebuttal,
  Report,
} from "@/lib/types"

interface UseDebateStreamOptions {
  debateId: string
  question: string
  socratesEnabled: boolean
}

export function useDebateStream({
  debateId,
  question,
  socratesEnabled,
}: UseDebateStreamOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const hasStartedRef = useRef(false)

  const {
    startDebate,
    setProgress,
    setSocratesMeta,
    setPhilosophers,
    addMessage,
    setSixthRebuttal,
    setReport,
    setError,
    setStreaming,
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
  } = useDebateStore()

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (hasStartedRef.current) return
    if (!question) return

    hasStartedRef.current = true
    startDebate(debateId, question, socratesEnabled)

    const params = new URLSearchParams({
      question,
      socrates: String(socratesEnabled),
    })

    const es = new EventSource(`/api/debate/stream?${params.toString()}`)
    eventSourceRef.current = es

    es.addEventListener("progress", (event) => {
      const data = JSON.parse(event.data) as { percent: number; label: string }
      setProgress(data.percent, data.label)
    })

    es.addEventListener("socrates_waiting", () => {
      // Socrates phase has started; step is already set by startDebate
    })

    es.addEventListener("socrates", (event) => {
      const data = JSON.parse(event.data) as SocratesMeta
      setSocratesMeta(data)
    })

    es.addEventListener("philosophers", (event) => {
      const data = JSON.parse(event.data) as ClientPhilosopher[]
      setPhilosophers(data)
    })

    es.addEventListener("message", (event) => {
      const data = JSON.parse(event.data) as DebateMessage
      addMessage(data)
    })

    es.addEventListener("sixth", (event) => {
      const data = JSON.parse(event.data) as SixthRebuttal
      setSixthRebuttal(data)
    })

    es.addEventListener("report", (event) => {
      const data = JSON.parse(event.data) as Report
      setReport(data)
    })

    es.addEventListener("error", (event: Event) => {
      // SSE custom "error" events are MessageEvent; native errors are plain Event
      if (event instanceof MessageEvent && event.data) {
        const data = JSON.parse(event.data) as { message: string }
        setError(data.message)
      } else {
        setError("서버 연결이 끊어졌습니다. 다시 시도해주세요.")
      }
      es.close()
    })

    es.addEventListener("done", () => {
      setStreaming(false)
      es.close()
    })

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return
      setError("서버 연결이 끊어졌습니다. 다시 시도해주세요.")
      es.close()
    }

    return () => {
      es.close()
      eventSourceRef.current = null
      hasStartedRef.current = false
    }
  }, [
    debateId,
    question,
    socratesEnabled,
    startDebate,
    setProgress,
    setSocratesMeta,
    setPhilosophers,
    addMessage,
    setSixthRebuttal,
    setReport,
    setError,
    setStreaming,
  ])

  return {
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
    disconnect,
  }
}

"use client"

import { useEffect, useRef, useCallback } from "react"
import { useDebateStore } from "@/stores/debate-store"
import type {
  SocratesMeta,
  ClientPhilosopher,
  DebateMessage,
  SixthRebuttal,
  Report,
  PhilosophyTradition,
} from "@/lib/types"

interface UseDebateStreamOptions {
  debateId: string
  question: string
  socratesEnabled: boolean
  socratesMetaParam?: string
}

interface PhilosopherState {
  id: string
  tradition: PhilosophyTradition
  stance: string
  color: string
}

export function useDebateStream({
  debateId,
  question,
  socratesEnabled,
  socratesMetaParam,
}: UseDebateStreamOptions) {
  const abortRef = useRef<AbortController | null>(null)
  const hasStartedRef = useRef(false)

  const {
    startDebate,
    setStep,
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
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  useEffect(() => {
    if (hasStartedRef.current) return
    if (!question) return

    hasStartedRef.current = true
    const abortController = new AbortController()
    abortRef.current = abortController

    startDebate(debateId, question, socratesEnabled)

    async function runPipeline() {
      const signal = abortController.signal

      try {
        // Parse pre-analyzed Socrates meta if provided
        let parsedSocratesMeta: SocratesMeta | null = null
        if (socratesMetaParam) {
          parsedSocratesMeta = JSON.parse(decodeURIComponent(socratesMetaParam)) as SocratesMeta
          setSocratesMeta(parsedSocratesMeta)
          setProgress(15, "소크라테스 분석 완료")
        }

        // === Phase 1: Assign Philosophers ===
        setProgress(20, "철학자 배정 중...")
        const assignRes = await fetch("/api/debate/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            socratesMeta: parsedSocratesMeta,
          }),
          signal,
        })
        if (!assignRes.ok) {
          const err = await assignRes.json()
          throw new Error(err.error || "철학자 배정 실패")
        }
        const assignData = await assignRes.json() as {
          philosophers: ClientPhilosopher[]
          serverState: PhilosopherState[]
        }
        setPhilosophers(assignData.philosophers)
        setProgress(30, "철학자 5명 배정 완료")

        // === Phase 2: Debate Rounds ===
        let allMessages: DebateMessage[] = []
        let previousSummary: string | null = null
        let consensus: string[] = []
        let dissent: string[] = []

        for (let round = 1; round <= 3; round++) {
          setProgress(
            30 + Math.floor(((round - 1) / 3) * 50),
            `라운드 ${round} 진행 중...`
          )

          const roundRes = await fetch("/api/debate/round", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question,
              round,
              serverState: assignData.serverState,
              socratesMeta: parsedSocratesMeta,
              previousMessages: allMessages,
              previousSummary,
            }),
            signal,
          })
          if (!roundRes.ok) {
            const err = await roundRes.json()
            throw new Error(err.error || `라운드 ${round} 실패`)
          }
          const roundData = await roundRes.json() as {
            messages: DebateMessage[]
            summary: string | null
            consensus: string[] | null
            dissent: string[] | null
          }

          // Add messages one by one to trigger UI updates
          for (const msg of roundData.messages) {
            addMessage(msg)
          }
          allMessages = [...allMessages, ...roundData.messages]
          previousSummary = roundData.summary

          if (roundData.consensus) consensus = roundData.consensus
          if (roundData.dissent) dissent = roundData.dissent

          setProgress(
            30 + Math.floor((round / 3) * 50),
            `라운드 ${round} 완료`
          )
        }

        setProgress(82, "토론 완료")

        // === Phase 3: 6th AI ===
        setStep("sixth")
        setProgress(85, "제6의 AI 분석 중...")
        const sixthRes = await fetch("/api/debate/sixth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            messages: allMessages,
            socratesMeta: parsedSocratesMeta,
          }),
          signal,
        })
        if (!sixthRes.ok) {
          const err = await sixthRes.json()
          throw new Error(err.error || "제6의 AI 분석 실패")
        }
        const sixthData = await sixthRes.json() as SixthRebuttal
        setSixthRebuttal(sixthData)
        setProgress(90, "제6의 AI 분석 완료")

        // === Phase 4: Report ===
        setProgress(92, "보고서 생성 중...")
        const reportRes = await fetch("/api/debate/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            messages: allMessages,
            socratesMeta: parsedSocratesMeta,
            sixthRebuttal: sixthData,
            consensus,
            dissent,
          }),
          signal,
        })
        if (!reportRes.ok) {
          const err = await reportRes.json()
          throw new Error(err.error || "보고서 생성 실패")
        }
        const reportData = await reportRes.json() as Report
        setReport(reportData)
        setProgress(100, "완료")
        setStreaming(false)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        setError(message)
      }
    }

    runPipeline()

    return () => {
      abortController.abort()
      abortRef.current = null
      hasStartedRef.current = false
    }
  }, [
    debateId,
    question,
    socratesEnabled,
    socratesMetaParam,
    startDebate,
    setStep,
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

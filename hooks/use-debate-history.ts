"use client"

import { useCallback } from "react"
import type { DebateRecord } from "@/lib/types"

const STORAGE_KEY = "over6_debates"
const DAILY_COUNT_KEY = "over6_daily_count"
const MAX_RECORDS = 50
const DAILY_LIMIT = 3

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getRecords(): DebateRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DebateRecord[]) : []
  } catch {
    return []
  }
}

function getDailyCount(): { date: string; count: number } {
  if (typeof window === "undefined") return { date: getTodayKey(), count: 0 }
  try {
    const raw = localStorage.getItem(DAILY_COUNT_KEY)
    if (!raw) return { date: getTodayKey(), count: 0 }
    const parsed = JSON.parse(raw) as { date: string; count: number }
    if (parsed.date !== getTodayKey()) {
      return { date: getTodayKey(), count: 0 }
    }
    return parsed
  } catch {
    return { date: getTodayKey(), count: 0 }
  }
}

export function useDebateHistory() {
  const saveDebate = useCallback((record: DebateRecord) => {
    const records = getRecords()
    const existingIndex = records.findIndex((r) => r.id === record.id)

    if (existingIndex >= 0) {
      records[existingIndex] = record
    } else {
      records.unshift(record)
    }

    // Keep only the most recent MAX_RECORDS
    const trimmed = records.slice(0, MAX_RECORDS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }, [])

  const getDebate = useCallback((id: string): DebateRecord | null => {
    const records = getRecords()
    return records.find((r) => r.id === id) ?? null
  }, [])

  const getAllDebates = useCallback((): DebateRecord[] => {
    return getRecords()
  }, [])

  const deleteDebate = useCallback((id: string) => {
    const records = getRecords().filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [])

  const canStartDebate = useCallback((): boolean => {
    const { count } = getDailyCount()
    return count < DAILY_LIMIT
  }, [])

  const getRemainingCount = useCallback((): number => {
    const { count } = getDailyCount()
    return Math.max(0, DAILY_LIMIT - count)
  }, [])

  const incrementDailyCount = useCallback(() => {
    const today = getTodayKey()
    const current = getDailyCount()
    const newCount = current.date === today ? current.count + 1 : 1
    localStorage.setItem(
      DAILY_COUNT_KEY,
      JSON.stringify({ date: today, count: newCount })
    )
  }, [])

  return {
    saveDebate,
    getDebate,
    getAllDebates,
    deleteDebate,
    canStartDebate,
    getRemainingCount,
    incrementDailyCount,
  }
}

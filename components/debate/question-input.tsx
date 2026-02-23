"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MAX_QUESTION_LENGTH } from "@/lib/constants"
import { Sparkles, AlertTriangle, MessageSquare } from "lucide-react"

const POPULAR_TOPICS = [
  "연봉 vs 성장",
  "창업 vs 취업",
  "사형제도 존폐",
  "AI 직업 대체",
  "기본소득제",
]

interface QuestionInputProps {
  onSubmit: (question: string, socratesEnabled: boolean) => void
  disabled?: boolean
  remainingCount: number
  defaultQuestion?: string
}

export function QuestionInput({
  onSubmit,
  disabled = false,
  remainingCount,
  defaultQuestion = "",
}: QuestionInputProps) {
  const [question, setQuestion] = useState(defaultQuestion)
  const [socratesEnabled, setSocratesEnabled] = useState(true)

  const charCount = question.length
  const isOverLimit = charCount > MAX_QUESTION_LENGTH
  const canSubmit =
    question.trim().length > 0 && !isOverLimit && !disabled && remainingCount > 0

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit(question.trim(), socratesEnabled)
  }

  function handleTopicClick(topic: string) {
    setQuestion(topic)
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="question-input"
          className="flex items-center gap-2 text-sm font-medium text-zinc-300"
        >
          <MessageSquare className="size-4" />
          토론 주제를 입력하세요
        </label>
        <div className="relative">
          <Textarea
            id="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 사형제도는 폐지되어야 하는가?"
            className="min-h-[120px] resize-none bg-[#1a1a1a] text-base"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <span
            className={`absolute right-3 bottom-3 text-xs ${
              isOverLimit ? "text-red-400" : "text-zinc-500"
            }`}
          >
            {charCount}/{MAX_QUESTION_LENGTH}
          </span>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-500">인기 주제</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TOPICS.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="cursor-pointer transition-colors hover:bg-indigo-500/20 hover:text-indigo-300"
              onClick={() => handleTopicClick(topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* Socrates Toggle */}
      <div className="rounded-lg border border-zinc-800 bg-[#1a1a1a] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-indigo-400" />
            <div>
              <p className="text-sm font-medium">소크라테스 엔진</p>
              <p className="text-xs text-zinc-500">
                질문의 프레이밍과 숨겨진 전제를 분석합니다
              </p>
            </div>
          </div>
          <Switch
            checked={socratesEnabled}
            onCheckedChange={setSocratesEnabled}
          />
        </div>
        {!socratesEnabled && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300">
              엔진을 끄면 질문이 정제 없이 토론에 들어갑니다.
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          오늘 남은 토론: {remainingCount}회
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-indigo-600 px-8 text-white hover:bg-indigo-500"
          size="lg"
        >
          토론 시작
        </Button>
      </div>
    </div>
  )
}

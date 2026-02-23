"use client"

import type { DebateStep } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  currentStep: DebateStep
  progress: number
  label: string
  socratesEnabled: boolean
}

interface StepDef {
  key: DebateStep | DebateStep[]
  label: string
}

const STEPS_WITH_SOCRATES: StepDef[] = [
  { key: "socrates", label: "소크라테스" },
  { key: "assign", label: "배정" },
  { key: ["round1", "round2", "round3"], label: "토론" },
  { key: "sixth", label: "면벽자" },
  { key: ["report", "complete"], label: "리포트" },
]

const STEPS_WITHOUT_SOCRATES: StepDef[] = [
  { key: "assign", label: "배정" },
  { key: ["round1", "round2", "round3"], label: "토론" },
  { key: "sixth", label: "면벽자" },
  { key: ["report", "complete"], label: "리포트" },
]

function isStepActive(stepDef: StepDef, currentStep: DebateStep): boolean {
  if (Array.isArray(stepDef.key)) {
    return stepDef.key.includes(currentStep)
  }
  return stepDef.key === currentStep
}

function isStepCompleted(
  stepDef: StepDef,
  stepIndex: number,
  steps: StepDef[],
  currentStep: DebateStep
): boolean {
  // Find the index of the current step
  const currentStepIndex = steps.findIndex((s) => isStepActive(s, currentStep))
  return currentStepIndex > stepIndex
}

export function ProgressBar({
  currentStep,
  progress,
  label,
  socratesEnabled,
}: ProgressBarProps) {
  const steps = socratesEnabled ? STEPS_WITH_SOCRATES : STEPS_WITHOUT_SOCRATES

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-xs font-medium text-zinc-300">{progress}%</p>
      </div>
      <Progress
        value={progress}
        className="h-1.5 bg-zinc-800 [&>[data-slot=progress-indicator]]:bg-indigo-500"
      />
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const active = isStepActive(step, currentStep)
          const completed = isStepCompleted(step, index, steps, currentStep)

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs",
                  completed && "bg-indigo-500 text-white",
                  active && "bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/50",
                  !completed && !active && "bg-zinc-800 text-zinc-600"
                )}
              >
                {completed ? (
                  <svg
                    className="size-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs",
                  active ? "text-indigo-300" : "text-zinc-600"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

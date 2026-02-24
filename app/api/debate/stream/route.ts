import { runSocrates, buildSocratesMeta } from "@/lib/ai/socrates"
import { assignPhilosophers } from "@/lib/ai/assigner"
import { runDebate } from "@/lib/ai/debate"
import { runSixthAI } from "@/lib/ai/sixth-ai"
import { generateReport } from "@/lib/ai/reporter"
import { MAX_QUESTION_LENGTH } from "@/lib/constants"
import type { SSEEventType, DebateMessage, Philosopher, ClientPhilosopher, SocratesMeta } from "@/lib/types"

export const maxDuration = 300

function sendSSE(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  type: SSEEventType,
  data: unknown
) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
  controller.enqueue(encoder.encode(payload))
}

function sendProgress(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  percent: number,
  label: string
) {
  sendSSE(controller, encoder, "progress", { percent, label })
}

function stripSystemPrompt(philosopher: Philosopher): ClientPhilosopher {
  const { systemPrompt: _, ...rest } = philosopher
  return rest
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const question = searchParams.get("question")
  const socratesEnabled = searchParams.get("socrates") !== "false"
  // Pre-analyzed Socrates meta (from 2-step flow)
  const socratesMetaParam = searchParams.get("socratesMeta")

  if (!question || question.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "질문을 입력해주세요." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return new Response(
      JSON.stringify({ error: `질문은 ${MAX_QUESTION_LENGTH}자 이하로 입력해주세요.` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // === Phase 1: Socrates ===
        let socratesMeta: SocratesMeta | null = null

        if (socratesMetaParam) {
          // 2-step flow: user already chose from Socrates options
          socratesMeta = JSON.parse(decodeURIComponent(socratesMetaParam)) as SocratesMeta
          sendSSE(controller, encoder, "socrates", socratesMeta)
          sendProgress(controller, encoder, 15, "소크라테스 분석 완료")
        } else if (socratesEnabled) {
          sendProgress(controller, encoder, 5, "소크라테스 분석 중...")
          sendSSE(controller, encoder, "socrates_waiting", {
            message: "질문의 프레이밍과 숨겨진 전제를 분석하고 있습니다...",
          })

          socratesMeta = await runSocrates(question)
          sendSSE(controller, encoder, "socrates", socratesMeta)
          sendProgress(controller, encoder, 15, "소크라테스 분석 완료")
        }

        // === Phase 2: Assignment ===
        sendProgress(controller, encoder, 20, "철학자 배정 중...")
        const effectiveQuestion = socratesMeta?.refinedQuestion || question
        const philosophers = await assignPhilosophers(effectiveQuestion, socratesMeta)

        // Strip systemPrompt before sending to client
        const clientPhilosophers = philosophers.map(stripSystemPrompt)
        sendSSE(controller, encoder, "philosophers", clientPhilosophers)
        sendProgress(controller, encoder, 30, "철학자 5명 배정 완료")

        // === Phase 3: Debate ===
        let messageCount = 0
        const totalExpectedMessages = 15 // 5 philosophers x 3 rounds

        const onMessage = (message: DebateMessage) => {
          messageCount++
          sendSSE(controller, encoder, "message", message)
          // Progress: 30% to 80% during debate
          const debateProgress = 30 + Math.floor((messageCount / totalExpectedMessages) * 50)
          sendProgress(
            controller,
            encoder,
            Math.min(debateProgress, 80),
            `토론 진행 중... (${messageCount}/${totalExpectedMessages})`
          )
        }

        sendProgress(controller, encoder, 32, "토론 시작...")
        const { messages, consensus, dissent } = await runDebate(
          effectiveQuestion,
          philosophers,
          onMessage
        )
        sendProgress(controller, encoder, 82, "토론 완료")

        // === Phase 4: 6th AI ===
        sendProgress(controller, encoder, 85, "제6의 AI 분석 중...")
        const sixthRebuttal = await runSixthAI(question, messages, socratesMeta)
        sendSSE(controller, encoder, "sixth", sixthRebuttal)
        sendProgress(controller, encoder, 90, "제6의 AI 분석 완료")

        // === Phase 5: Report ===
        sendProgress(controller, encoder, 92, "보고서 생성 중...")
        const report = await generateReport(
          question,
          messages,
          socratesMeta,
          sixthRebuttal,
          consensus,
          dissent
        )
        sendSSE(controller, encoder, "report", report)
        sendProgress(controller, encoder, 100, "완료")

        // === Done ===
        sendSSE(controller, encoder, "done", {
          totalMessages: messages.length,
          totalTime: Date.now(),
        })

        controller.close()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
        sendSSE(controller, encoder, "error", { message: errorMessage })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

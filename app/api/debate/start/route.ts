import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { MAX_QUESTION_LENGTH } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question, socrates } = body as {
      question?: string
      socrates?: boolean
    }

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "질문을 입력해주세요." },
        { status: 400 }
      )
    }

    const trimmed = question.trim()

    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: "질문을 입력해주세요." },
        { status: 400 }
      )
    }

    if (trimmed.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `질문은 ${MAX_QUESTION_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 }
      )
    }

    const debateId = nanoid()

    return NextResponse.json({
      debateId,
      question: trimmed,
      socratesEnabled: socrates ?? true,
    })
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    )
  }
}

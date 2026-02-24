import { chatCompletionJSON } from "@/lib/ai/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = body.question as string

    if (!question) {
      return Response.json({ error: "질문이 필요합니다." }, { status: 400 })
    }

    const result = await chatCompletionJSON<{ title: string }>(
      `너는 토론 제목 작성 전문가다.
주어진 질문과 토론 내용을 바탕으로, 독자의 호기심을 자극하는 짧고 매력적인 제목을 만들어라.
제목은 15~30자, 질문 형태가 아닌 주제 형태로.
JSON: { "title": "제목" }`,
      `질문: "${question}"`
    )

    return Response.json({ title: result.title })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}

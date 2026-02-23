import OpenAI from "openai"
import { MODELS } from "@/lib/constants"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: options?.model || MODELS.default,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: options?.temperature ?? 0.8,
    max_tokens: options?.maxTokens ?? 1024,
  })
  return response.choices[0]?.message?.content || ""
}

export async function chatCompletionJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<T> {
  const fullSystemPrompt =
    systemPrompt +
    "\n\n반드시 유효한 JSON으로만 응답하라. 다른 텍스트를 포함하지 마라."

  let content: string

  try {
    const response = await openai.chat.completions.create({
      model: options?.model || MODELS.default,
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      response_format: { type: "json_object" },
    })
    content = response.choices[0]?.message?.content || "{}"
  } catch {
    // Fallback: some OpenAI-compatible APIs don't support response_format
    const response = await openai.chat.completions.create({
      model: options?.model || MODELS.default,
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    })
    content = response.choices[0]?.message?.content || "{}"
  }

  try {
    return JSON.parse(content) as T
  } catch {
    // Try to extract JSON from response text (e.g. wrapped in ```json blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
    throw new Error(`Failed to parse JSON response: ${content.slice(0, 200)}`)
  }
}

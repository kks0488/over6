import OpenAI from "openai"
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions"
import { MODELS, REASONING_EFFORT } from "@/lib/constants"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

interface CompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  reasoningEffort?: string
}

type CreateParams = ChatCompletionCreateParamsNonStreaming & {
  reasoning?: { effort: string }
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: CompletionOptions
): Promise<string> {
  const params: CreateParams = {
    model: options?.model || MODELS.default,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: options?.temperature ?? 0.8,
    max_tokens: options?.maxTokens ?? 1024,
    reasoning: { effort: options?.reasoningEffort || REASONING_EFFORT.default },
  }
  const response = await openai.chat.completions.create(params as ChatCompletionCreateParamsNonStreaming)
  return response.choices[0]?.message?.content || ""
}

export async function chatCompletionJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: CompletionOptions
): Promise<T> {
  const fullSystemPrompt =
    systemPrompt +
    "\n\n반드시 유효한 JSON으로만 응답하라. 다른 텍스트를 포함하지 마라."

  let content: string

  try {
    const params: CreateParams = {
      model: options?.model || MODELS.default,
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      response_format: { type: "json_object" },
      reasoning: { effort: options?.reasoningEffort || REASONING_EFFORT.default },
    }
    const response = await openai.chat.completions.create(params as ChatCompletionCreateParamsNonStreaming)
    content = response.choices[0]?.message?.content || "{}"
  } catch {
    // Fallback: some OpenAI-compatible APIs don't support response_format
    const params: CreateParams = {
      model: options?.model || MODELS.default,
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      reasoning: { effort: options?.reasoningEffort || REASONING_EFFORT.default },
    }
    const response = await openai.chat.completions.create(params as ChatCompletionCreateParamsNonStreaming)
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

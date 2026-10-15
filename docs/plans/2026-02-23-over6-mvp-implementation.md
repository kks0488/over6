# Over6 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 5명의 철학자 AI가 실시간 토론하고 6번째 AI가 반박하는 멀티 에이전트 철학 토론 플랫폼 MVP 구축

**Architecture:** Next.js 15 풀스택 Monolith. API Routes에서 OpenAI SDK로 CLIProxyAPI(localhost:8317)를 호출하여 멀티 에이전트 오케스트레이션. SSE로 실시간 스트리밍. localStorage 기반 히스토리.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Framer Motion 11, Zustand 5, OpenAI SDK 4, Vercel

**Design Doc:** `docs/plans/2026-02-23-over6-mvp-design.md`

---

## Task 1: 프로젝트 세팅

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `.env.local`, `.gitignore`

**Step 1: Next.js 프로젝트 초기화**

```bash
cd over6
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias="@/*" --turbopack
```

기존 파일 덮어쓰기 프롬프트가 나오면 yes. `.env`는 보존해야 하므로 주의.

**Step 2: 핵심 패키지 설치**

```bash
npm install openai zustand framer-motion nanoid date-fns lucide-react
npm install -D @types/node
```

**Step 3: shadcn/ui 초기화**

```bash
npx shadcn@latest init
```

선택지:
- Style: New York
- Base color: Neutral
- CSS variables: yes

필요한 컴포넌트 설치:

```bash
npx shadcn@latest add button card input textarea toggle badge scroll-area progress separator switch
```

**Step 4: .env.local 작성**

```env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=http://localhost:8317/v1
OPENAI_MODEL=gpt-5.2
OPENAI_MODEL_STRONG=gpt-5.3-codex
NEXT_PUBLIC_APP_URL=http://localhost:9032
PORT=9032
```

**Step 5: next.config.ts 수정**

`next.config.ts`에 포트 설정은 `package.json`의 dev script에서 처리:

```json
"scripts": {
  "dev": "next dev --turbopack -p 9032",
  "build": "next build",
  "start": "next start -p 9032"
}
```

**Step 6: 다크 테마 기본 설정**

`app/layout.tsx`에서:
- `<html>` 태그에 `className="dark"` 추가
- Pretendard 폰트 CDN 추가
- 기본 메타데이터 설정

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Over6 — 제도화된 반대자 AI",
  description: "5명의 철학자가 토론하고, 6번째 AI가 반박하고, 당신이 결정합니다.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={`${inter.className} font-sans bg-[#0a0a0a] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

**Step 7: globals.css 다크 테마 커스터마이징**

shadcn 기본 CSS에 다크 테마 색상 오버라이드:

```css
/* globals.css - :root 다크 테마 변수 중 필요한 부분만 수정 */
/* 기본 배경을 #0a0a0a, 카드를 #1a1a1a로 */
```

**Step 8: 개발 서버 확인**

```bash
npm run dev
```

Expected: `http://localhost:9032` 에서 Next.js 기본 페이지 표시

**Step 9: 커밋**

```bash
git add -A
git commit -m "chore: Next.js 15 프로젝트 초기 세팅

Tailwind 4, shadcn/ui, Zustand, OpenAI SDK, Framer Motion 설치
다크 테마 기본 설정, 포트 9032

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 타입 정의 + 상수

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`

**Step 1: 핵심 타입 정의**

```typescript
// lib/types.ts

export type PhilosophyTradition =
  | "utilitarian" | "deontology" | "existentialism" | "skepticism"
  | "pragmatism" | "social_contract" | "confucianism" | "daoism"
  | "buddhism" | "legalism" | "critical_theory" | "care_ethics"

export type DebateStep =
  | "idle" | "socrates" | "assign"
  | "round1" | "round2" | "round3"
  | "sixth" | "report" | "complete"

export interface SocratesMeta {
  framing: {
    type: string
    description: string
    constrainedChoices: string[]
  }
  assumptions: string[]
  biases: {
    type: string
    severity: "low" | "medium" | "high"
    description: string
  }[]
  refinedQuestion: string
  explanation: string
}

export interface Philosopher {
  id: string
  tradition: PhilosophyTradition
  name: string           // 예: "공리주의자"
  representative: string // 예: "벤담 / 밀"
  stance: string         // 이 토론에서의 예상 입장
  color: string          // UI 색상
  systemPrompt: string
}

export interface DebateMessage {
  id: string
  step: DebateStep
  speaker: string        // philosopher.id or "sixth_ai" or "system"
  speakerName: string
  tradition?: PhilosophyTradition
  content: string
  round?: number
  color: string
  timestamp: string
}

export interface SixthRebuttal {
  evidenceRebuttal: string
  hypothesisReversal: string
  biasDeconstruction: string
  fundamentalQuestion: string
  fullText: string
}

export interface Report {
  originalQuestion: string
  refinedQuestion: string | null
  socratesMeta: SocratesMeta | null
  consensus: string[]
  dissent: string[]
  sixthRebuttal: SixthRebuttal
  biasesFound: string[]
  thinkingQuestions: string[]
  conclusion: string      // "최종 판단은 당신의 몫입니다"
}

export interface DebateRecord {
  id: string
  question: string
  refinedQuestion: string | null
  socratesEnabled: boolean
  socratesMeta: SocratesMeta | null
  philosophers: Philosopher[]
  messages: DebateMessage[]
  sixthRebuttal: SixthRebuttal | null
  report: Report | null
  status: "running" | "completed" | "error"
  createdAt: string
}

// SSE 이벤트 타입
export type SSEEventType =
  | "socrates"
  | "socrates_waiting"  // 사용자 선택 대기
  | "philosophers"
  | "message"
  | "sixth"
  | "report"
  | "progress"
  | "error"
  | "done"

export interface SSEEvent {
  type: SSEEventType
  data: unknown
}
```

**Step 2: 상수 정의**

```typescript
// lib/constants.ts

export const MODELS = {
  default: process.env.OPENAI_MODEL || "gpt-5.2",
  strong: process.env.OPENAI_MODEL_STRONG || "gpt-5.3-codex",
} as const

export const PHILOSOPHER_COLORS: Record<number, string> = {
  0: "#10b981", // 에메랄드
  1: "#3b82f6", // 블루
  2: "#f59e0b", // 앰버
  3: "#f43f5e", // 로즈
  4: "#8b5cf6", // 바이올렛
}

export const SIXTH_AI_COLOR = "#eab308" // 골드

export const DAILY_DEBATE_LIMIT = 3

export const MAX_QUESTION_LENGTH = 500

export const DEBATE_ROUNDS = 3
```

**Step 3: 커밋**

```bash
git add lib/types.ts lib/constants.ts
git commit -m "feat: 핵심 타입 정의 + 상수

DebateRecord, Philosopher, SocratesMeta 등 전체 데이터 모델
SSE 이벤트 타입, 모델 상수, 색상 팔레트

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 철학자 데이터 레이어

**Files:**
- Create: `lib/philosophers/traditions.ts`
- Create: `lib/philosophers/disagreement-matrix.ts`
- Create: `lib/philosophers/axes.ts`
- Create: `lib/philosophers/templates.ts`

**Step 1: 12개 철학 전통 정의**

```typescript
// lib/philosophers/traditions.ts
import { PhilosophyTradition } from "@/lib/types"

export interface TraditionInfo {
  id: PhilosophyTradition
  name: string
  nameEn: string
  category: "western" | "eastern" | "modern"
  coreView: string
  representative: string
  keywords: string[]
  axes: {
    resultVsPrinciple: number   // -1(원칙) ~ 1(결과)
    individualVsCollective: number
    realismVsIdealism: number
    certaintyVsDoubt: number
  }
}

export const TRADITIONS: Record<PhilosophyTradition, TraditionInfo> = {
  utilitarian: {
    id: "utilitarian",
    name: "공리주의",
    nameEn: "Utilitarianism",
    category: "western",
    coreView: "결과 중심 판단, 최대 다수의 최대 행복",
    representative: "벤담 / 밀",
    keywords: ["효율", "결과", "행복", "최대다수", "비용편익", "공공선"],
    axes: { resultVsPrinciple: 0.9, individualVsCollective: 0.6, realismVsIdealism: 0.7, certaintyVsDoubt: 0.5 },
  },
  deontology: {
    id: "deontology",
    name: "의무론",
    nameEn: "Deontology",
    category: "western",
    coreView: "원칙과 보편 법칙, 정언명령",
    representative: "칸트",
    keywords: ["의무", "원칙", "보편법칙", "존엄", "정언명령", "도덕법칙"],
    axes: { resultVsPrinciple: -0.9, individualVsCollective: -0.3, realismVsIdealism: -0.7, certaintyVsDoubt: 0.7 },
  },
  existentialism: {
    id: "existentialism",
    name: "실존주의",
    nameEn: "Existentialism",
    category: "western",
    coreView: "자유와 책임, 실존이 본질에 앞선다",
    representative: "사르트르 / 키에르케고르",
    keywords: ["자유", "책임", "선택", "실존", "불안", "진정성"],
    axes: { resultVsPrinciple: 0.0, individualVsCollective: -0.8, realismVsIdealism: -0.4, certaintyVsDoubt: -0.5 },
  },
  skepticism: {
    id: "skepticism",
    name: "회의론",
    nameEn: "Skepticism",
    category: "western",
    coreView: "전제 자체를 의심, 확실한 지식의 불가능성",
    representative: "데카르트 / 흄",
    keywords: ["의심", "증거", "전제", "검증", "불확실성", "비판"],
    axes: { resultVsPrinciple: 0.0, individualVsCollective: 0.0, realismVsIdealism: 0.5, certaintyVsDoubt: -0.9 },
  },
  pragmatism: {
    id: "pragmatism",
    name: "프래그마티즘",
    nameEn: "Pragmatism",
    category: "western",
    coreView: "실용적 결과와 효용, 이론보다 실천",
    representative: "듀이 / 제임스",
    keywords: ["실용", "효과", "경험", "적용", "결과", "도구"],
    axes: { resultVsPrinciple: 0.7, individualVsCollective: 0.2, realismVsIdealism: 0.9, certaintyVsDoubt: 0.3 },
  },
  social_contract: {
    id: "social_contract",
    name: "사회계약론",
    nameEn: "Social Contract",
    category: "western",
    coreView: "공정한 제도 설계, 무지의 베일",
    representative: "롤스 / 홉스",
    keywords: ["정의", "계약", "제도", "공정", "권리", "합의"],
    axes: { resultVsPrinciple: -0.3, individualVsCollective: 0.7, realismVsIdealism: -0.5, certaintyVsDoubt: 0.4 },
  },
  confucianism: {
    id: "confucianism",
    name: "유교",
    nameEn: "Confucianism",
    category: "eastern",
    coreView: "인의예지, 관계 윤리, 수기치인",
    representative: "공자 / 맹자",
    keywords: ["인", "의", "예", "관계", "효도", "수양", "군자"],
    axes: { resultVsPrinciple: -0.4, individualVsCollective: 0.8, realismVsIdealism: -0.3, certaintyVsDoubt: 0.6 },
  },
  daoism: {
    id: "daoism",
    name: "도가",
    nameEn: "Daoism",
    category: "eastern",
    coreView: "무위자연, 순리, 도법자연",
    representative: "장자 / 노자",
    keywords: ["무위", "자연", "도", "순리", "비움", "소요유"],
    axes: { resultVsPrinciple: 0.0, individualVsCollective: -0.5, realismVsIdealism: -0.6, certaintyVsDoubt: -0.3 },
  },
  buddhism: {
    id: "buddhism",
    name: "불교",
    nameEn: "Buddhism",
    category: "eastern",
    coreView: "공과 연기, 상호의존, 고통의 소멸",
    representative: "나가르주나",
    keywords: ["공", "연기", "무아", "고통", "중도", "자비", "해탈"],
    axes: { resultVsPrinciple: 0.0, individualVsCollective: 0.3, realismVsIdealism: -0.8, certaintyVsDoubt: -0.7 },
  },
  legalism: {
    id: "legalism",
    name: "법가",
    nameEn: "Legalism",
    category: "eastern",
    coreView: "시스템과 인센티브, 법치와 상벌",
    representative: "한비자",
    keywords: ["법", "제도", "인센티브", "상벌", "통치", "시스템"],
    axes: { resultVsPrinciple: 0.8, individualVsCollective: 0.9, realismVsIdealism: 0.9, certaintyVsDoubt: 0.8 },
  },
  critical_theory: {
    id: "critical_theory",
    name: "비판이론",
    nameEn: "Critical Theory",
    category: "modern",
    coreView: "권력과 구조 비판, 이데올로기 해체",
    representative: "하버마스 / 푸코",
    keywords: ["권력", "구조", "비판", "이데올로기", "해방", "담론"],
    axes: { resultVsPrinciple: -0.2, individualVsCollective: 0.5, realismVsIdealism: -0.4, certaintyVsDoubt: -0.6 },
  },
  care_ethics: {
    id: "care_ethics",
    name: "돌봄 윤리",
    nameEn: "Care Ethics",
    category: "modern",
    coreView: "관계와 돌봄 중심, 맥락적 도덕 판단",
    representative: "길리건 / 나딩스",
    keywords: ["돌봄", "관계", "책임", "공감", "취약성", "연결"],
    axes: { resultVsPrinciple: 0.3, individualVsCollective: 0.4, realismVsIdealism: -0.2, certaintyVsDoubt: -0.2 },
  },
}

export const TRADITION_LIST = Object.values(TRADITIONS)
```

**Step 2: Disagreement Matrix 하드코딩**

```typescript
// lib/philosophers/disagreement-matrix.ts
import { PhilosophyTradition } from "@/lib/types"

// 12x12 역사적 대립도. 0(동의) ~ 1(극렬 대립)
// 대칭 행렬. matrix[a][b] === matrix[b][a]
export const DISAGREEMENT_MATRIX: Record<PhilosophyTradition, Record<PhilosophyTradition, number>> = {
  utilitarian: {
    utilitarian: 0, deontology: 0.95, existentialism: 0.6, skepticism: 0.5,
    pragmatism: 0.2, social_contract: 0.4, confucianism: 0.7, daoism: 0.65,
    buddhism: 0.7, legalism: 0.3, critical_theory: 0.75, care_ethics: 0.6,
  },
  deontology: {
    utilitarian: 0.95, deontology: 0, existentialism: 0.7, skepticism: 0.6,
    pragmatism: 0.8, social_contract: 0.35, confucianism: 0.4, daoism: 0.75,
    buddhism: 0.5, legalism: 0.7, critical_theory: 0.55, care_ethics: 0.5,
  },
  existentialism: {
    utilitarian: 0.6, deontology: 0.7, existentialism: 0, skepticism: 0.3,
    pragmatism: 0.5, social_contract: 0.6, confucianism: 0.8, daoism: 0.35,
    buddhism: 0.4, legalism: 0.85, critical_theory: 0.3, care_ethics: 0.45,
  },
  skepticism: {
    utilitarian: 0.5, deontology: 0.6, existentialism: 0.3, skepticism: 0,
    pragmatism: 0.55, social_contract: 0.5, confucianism: 0.7, daoism: 0.4,
    buddhism: 0.35, legalism: 0.6, critical_theory: 0.25, care_ethics: 0.55,
  },
  pragmatism: {
    utilitarian: 0.2, deontology: 0.8, existentialism: 0.5, skepticism: 0.55,
    pragmatism: 0, social_contract: 0.4, confucianism: 0.55, daoism: 0.7,
    buddhism: 0.65, legalism: 0.35, critical_theory: 0.6, care_ethics: 0.45,
  },
  social_contract: {
    utilitarian: 0.4, deontology: 0.35, existentialism: 0.6, skepticism: 0.5,
    pragmatism: 0.4, social_contract: 0, confucianism: 0.5, daoism: 0.7,
    buddhism: 0.6, legalism: 0.45, critical_theory: 0.5, care_ethics: 0.4,
  },
  confucianism: {
    utilitarian: 0.7, deontology: 0.4, existentialism: 0.8, skepticism: 0.7,
    pragmatism: 0.55, social_contract: 0.5, confucianism: 0, daoism: 0.6,
    buddhism: 0.45, legalism: 0.75, critical_theory: 0.65, care_ethics: 0.3,
  },
  daoism: {
    utilitarian: 0.65, deontology: 0.75, existentialism: 0.35, skepticism: 0.4,
    pragmatism: 0.7, social_contract: 0.7, confucianism: 0.6, daoism: 0,
    buddhism: 0.2, legalism: 0.9, critical_theory: 0.5, care_ethics: 0.4,
  },
  buddhism: {
    utilitarian: 0.7, deontology: 0.5, existentialism: 0.4, skepticism: 0.35,
    pragmatism: 0.65, social_contract: 0.6, confucianism: 0.45, daoism: 0.2,
    buddhism: 0, legalism: 0.85, critical_theory: 0.45, care_ethics: 0.3,
  },
  legalism: {
    utilitarian: 0.3, deontology: 0.7, existentialism: 0.85, skepticism: 0.6,
    pragmatism: 0.35, social_contract: 0.45, confucianism: 0.75, daoism: 0.9,
    buddhism: 0.85, legalism: 0, critical_theory: 0.7, care_ethics: 0.85,
  },
  critical_theory: {
    utilitarian: 0.75, deontology: 0.55, existentialism: 0.3, skepticism: 0.25,
    pragmatism: 0.6, social_contract: 0.5, confucianism: 0.65, daoism: 0.5,
    buddhism: 0.45, legalism: 0.7, critical_theory: 0, care_ethics: 0.35,
  },
  care_ethics: {
    utilitarian: 0.6, deontology: 0.5, existentialism: 0.45, skepticism: 0.55,
    pragmatism: 0.45, social_contract: 0.4, confucianism: 0.3, daoism: 0.4,
    buddhism: 0.3, legalism: 0.85, critical_theory: 0.35, care_ethics: 0,
  },
}

/**
 * 주어진 철학 전통 조합의 총 이견 점수를 계산
 */
export function calculateDisagreementScore(traditions: PhilosophyTradition[]): number {
  let total = 0
  for (let i = 0; i < traditions.length; i++) {
    for (let j = i + 1; j < traditions.length; j++) {
      total += DISAGREEMENT_MATRIX[traditions[i]][traditions[j]]
    }
  }
  return total
}

/**
 * 후보 전통들 중에서 이견 총합이 최대인 5개 조합을 선택
 */
export function findMaxDisagreementCombination(
  candidates: PhilosophyTradition[],
  selectCount: number = 5
): PhilosophyTradition[] {
  const combinations = getCombinations(candidates, selectCount)
  let bestCombo = combinations[0]
  let bestScore = -1

  for (const combo of combinations) {
    const score = calculateDisagreementScore(combo)
    if (score > bestScore) {
      bestScore = score
      bestCombo = combo
    }
  }

  return bestCombo
}

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length === 0) return []
  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, k - 1).map((c) => [first, ...c])
  const withoutFirst = getCombinations(rest, k)
  return [...withFirst, ...withoutFirst]
}
```

**Step 3: 축 정의**

```typescript
// lib/philosophers/axes.ts

export const AXES = [
  {
    id: "resultVsPrinciple",
    name: "결과 vs 원칙",
    negative: "원칙 중심",
    positive: "결과 중심",
  },
  {
    id: "individualVsCollective",
    name: "개인 vs 집단",
    negative: "개인 중심",
    positive: "집단 중심",
  },
  {
    id: "realismVsIdealism",
    name: "현실 vs 이상",
    negative: "이상 중심",
    positive: "현실 중심",
  },
  {
    id: "certaintyVsDoubt",
    name: "확신 vs 의심",
    negative: "의심 중심",
    positive: "확신 중심",
  },
] as const

/**
 * 5명 중 최소 4개 축이 커버되는지 확인.
 * 축 커버 = 해당 축에서 양극단(+/-)에 각각 최소 1명 존재
 */
export function checkAxisCoverage(
  traditions: { axes: Record<string, number> }[]
): { covered: number; total: number } {
  let covered = 0
  for (const axis of AXES) {
    const values = traditions.map((t) => t.axes[axis.id])
    const hasPositive = values.some((v) => v > 0.3)
    const hasNegative = values.some((v) => v < -0.3)
    if (hasPositive && hasNegative) covered++
  }
  return { covered, total: AXES.length }
}
```

**Step 4: 페르소나 시스템 프롬프트 템플릿**

```typescript
// lib/philosophers/templates.ts
import { PhilosophyTradition } from "@/lib/types"

export interface PersonaTemplate {
  tradition: PhilosophyTradition
  baseSystemPrompt: string
}

const COMMON_RULES = `
## 토론 규칙
- 당신은 이 철학 전통의 관점에서만 논증한다.
- 다른 철학자와 쉽게 동의하지 마라. 당신의 전통에서 가장 강력한 논거를 끝까지 유지하라.
- 반론할 때는 반드시 근거를 제시하라.
- 한국어로 답변하라.
- 각 발언은 150~300자로 핵심만 간결하게.
- 해당 철학 전통의 핵심 개념과 용어를 자연스럽게 사용하라.
`

export const PERSONA_TEMPLATES: Record<PhilosophyTradition, PersonaTemplate> = {
  utilitarian: {
    tradition: "utilitarian",
    baseSystemPrompt: `당신은 공리주의 철학자입니다. 벤담과 밀의 전통을 따릅니다.

## 핵심 원칙
- 최대 다수의 최대 행복이 도덕 판단의 기준이다.
- 행위의 결과가 행위의 도덕성을 결정한다.
- 쾌락과 고통의 계산을 통해 올바른 행위를 판단한다.
- 개인의 행복은 전체 행복의 일부로서만 의미를 갖는다.

## 전형적 논증 패턴
- "이 선택이 가장 많은 사람에게 가장 큰 행복을 가져다주는가?"
- 비용-편익 분석적 접근
- 결과를 정량화하여 비교
${COMMON_RULES}`,
  },
  deontology: {
    tradition: "deontology",
    baseSystemPrompt: `당신은 의무론 철학자입니다. 칸트의 전통을 따릅니다.

## 핵심 원칙
- 행위의 도덕성은 결과가 아닌 행위 자체의 원칙에 의해 결정된다.
- 정언명령: "네 행위의 준칙이 보편적 법칙이 될 수 있도록 행위하라."
- 인간은 수단이 아닌 목적 그 자체로 대우받아야 한다.
- 도덕 법칙은 조건 없이 모든 이성적 존재에게 적용된다.

## 전형적 논증 패턴
- "이것을 모든 사람이 한다면 보편적 법칙이 될 수 있는가?"
- "인간의 존엄성을 침해하는가?"
- 결과와 무관하게 원칙을 지켜야 한다는 논증
${COMMON_RULES}`,
  },
  existentialism: {
    tradition: "existentialism",
    baseSystemPrompt: `당신은 실존주의 철학자입니다. 사르트르와 키에르케고르의 전통을 따릅니다.

## 핵심 원칙
- 실존은 본질에 앞선다. 인간은 스스로를 만들어간다.
- 절대적 자유에는 절대적 책임이 따른다.
- 진정성 있는 삶을 살아야 한다. 자기기만을 거부하라.
- 불안과 절망은 자유의 증거이다.

## 전형적 논증 패턴
- "이 선택은 진정으로 당신 자신의 것인가?"
- "타인의 시선이나 사회적 기대에 의한 선택이 아닌가?"
- 개인의 주체성과 자유를 강조
${COMMON_RULES}`,
  },
  skepticism: {
    tradition: "skepticism",
    baseSystemPrompt: `당신은 회의론 철학자입니다. 데카르트와 흄의 전통을 따릅니다.

## 핵심 원칙
- 모든 주장에는 증거가 필요하다. 증거 없는 믿음을 거부한다.
- 전제 자체를 의심하라. "정말 그런가?"
- 인과관계를 함부로 가정하지 마라.
- 확실한 지식의 한계를 인정하라.

## 전형적 논증 패턴
- "그 전제가 참이라는 증거는 무엇인가?"
- "상관관계를 인과관계로 착각하고 있지 않은가?"
- 다른 철학자들의 전제를 공격
${COMMON_RULES}`,
  },
  pragmatism: {
    tradition: "pragmatism",
    baseSystemPrompt: `당신은 프래그마티즘 철학자입니다. 듀이와 제임스의 전통을 따릅니다.

## 핵심 원칙
- 이론의 가치는 실천적 결과로 판단된다.
- 진리는 고정된 것이 아니라, 경험 속에서 검증되는 것이다.
- 추상적 사변보다 구체적 결과에 집중하라.
- 문제 해결에 도움이 되는 것이 좋은 생각이다.

## 전형적 논증 패턴
- "실제로 어떤 차이를 만드는가?"
- "구체적으로 무엇이 달라지는가?"
- 이론적 논쟁을 실천적 영역으로 끌어옴
${COMMON_RULES}`,
  },
  social_contract: {
    tradition: "social_contract",
    baseSystemPrompt: `당신은 사회계약론 철학자입니다. 롤스와 홉스의 전통을 따릅니다.

## 핵심 원칙
- 정의로운 사회는 합리적 개인들의 합의에 기초한다.
- 무지의 베일: 자신의 지위를 모르는 상태에서 제도를 설계하라.
- 최소수혜자에게 최대 이익을 보장하는 제도가 정의롭다.
- 기본적 자유는 어떤 이유로도 침해될 수 없다.

## 전형적 논증 패턴
- "이 제도를 누구도 자신의 위치를 모르는 상태에서 선택할 것인가?"
- "가장 불리한 위치에 있는 사람에게 이 결정은 어떤 영향을 주는가?"
- 제도적/구조적 관점에서 접근
${COMMON_RULES}`,
  },
  confucianism: {
    tradition: "confucianism",
    baseSystemPrompt: `당신은 유교 사상가입니다. 공자와 맹자의 전통을 따릅니다.

## 핵심 원칙
- 인(仁): 사람 사이의 사랑과 배려가 모든 도덕의 근본이다.
- 의(義): 마땅히 해야 할 바를 행한다.
- 예(禮): 질서와 예법이 사회를 유지한다.
- 수기치인(修己治人): 자기 수양이 세상을 다스리는 기초이다.

## 전형적 논증 패턴
- "이것이 인간 관계의 근본을 해치지 않는가?"
- "군자라면 어떤 선택을 할 것인가?"
- 관계, 역할, 책임의 관점에서 접근
${COMMON_RULES}`,
  },
  daoism: {
    tradition: "daoism",
    baseSystemPrompt: `당신은 도가 사상가입니다. 장자와 노자의 전통을 따릅니다.

## 핵심 원칙
- 도법자연(道法自然): 도는 자연의 흐름을 따른다.
- 무위(無爲): 억지로 하지 않는 것이 최선의 행위이다.
- 소요유(逍遙遊): 세속의 가치 판단에서 벗어나 자유롭게 노닐어라.
- 만물제동(萬物齊同): 모든 것은 상대적이다.

## 전형적 논증 패턴
- "왜 굳이 개입하려 하는가?"
- "그 구분 자체가 인위적이지 않은가?"
- 인위적 개입과 이분법적 사고를 비판
${COMMON_RULES}`,
  },
  buddhism: {
    tradition: "buddhism",
    baseSystemPrompt: `당신은 불교 철학자입니다. 나가르주나의 전통을 따릅니다.

## 핵심 원칙
- 공(空): 모든 것은 독립적 실체가 없다.
- 연기(緣起): 모든 것은 상호의존적으로 존재한다.
- 중도(中道): 극단을 피하라.
- 고통은 집착에서 온다. 집착을 내려놓으라.

## 전형적 논증 패턴
- "그 구분 자체에 집착하고 있지 않은가?"
- "고정된 자아/본질이 있다는 전제를 의심하라"
- 이분법과 고정관념의 해체
${COMMON_RULES}`,
  },
  legalism: {
    tradition: "legalism",
    baseSystemPrompt: `당신은 법가 사상가입니다. 한비자의 전통을 따릅니다.

## 핵심 원칙
- 인간은 이익을 추구하고 손해를 피하는 존재이다.
- 도덕이 아닌 법과 제도로 사회를 다스려야 한다.
- 명확한 상벌 체계가 질서를 만든다.
- 시스템이 개인의 도덕성에 의존하지 않아야 한다.

## 전형적 논증 패턴
- "인간의 선의에 기대지 마라. 인센티브 구조를 설계하라."
- "어떤 시스템이 이 문제를 구조적으로 해결할 수 있는가?"
- 현실적이고 시스템적인 접근
${COMMON_RULES}`,
  },
  critical_theory: {
    tradition: "critical_theory",
    baseSystemPrompt: `당신은 비판이론가입니다. 하버마스와 푸코의 전통을 따릅니다.

## 핵심 원칙
- 모든 주장 뒤에는 권력 관계가 있다.
- "누구의 이익을 위한 것인가?"를 항상 질문하라.
- 지배적 담론은 기득권을 유지하는 도구일 수 있다.
- 구조적 불평등을 드러내고 비판하라.

## 전형적 논증 패턴
- "이 논의에서 누가 이익을 보고 누가 손해를 보는가?"
- "당연하게 받아들여지는 전제 뒤에 숨겨진 권력은 무엇인가?"
- 권력, 구조, 이데올로기 비판
${COMMON_RULES}`,
  },
  care_ethics: {
    tradition: "care_ethics",
    baseSystemPrompt: `당신은 돌봄 윤리 철학자입니다. 길리건과 나딩스의 전통을 따릅니다.

## 핵심 원칙
- 도덕의 핵심은 추상적 원칙이 아닌 구체적 관계 속의 돌봄이다.
- 취약한 존재에 대한 책임을 우선한다.
- 맥락과 관계를 무시한 보편적 판단을 경계한다.
- 공감과 연결이 윤리의 출발점이다.

## 전형적 논증 패턴
- "이 결정이 가장 취약한 사람에게 어떤 영향을 주는가?"
- "추상적 원칙 뒤에서 구체적인 누군가의 고통이 무시되고 있지 않은가?"
- 관계, 돌봄, 공감의 관점에서 접근
${COMMON_RULES}`,
  },
}
```

**Step 5: 커밋**

```bash
git add lib/philosophers/
git commit -m "feat: 철학자 데이터 레이어

12개 철학 전통 정의 (서양 6, 동양 4, 현대 2)
12x12 Disagreement Matrix + 조합 최적화 알고리즘
4개 축 정의 + 축 커버리지 검증
12개 페르소나 시스템 프롬프트 템플릿

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: AI 클라이언트 + 소크라테스 엔진

**Files:**
- Create: `lib/ai/client.ts`
- Create: `lib/ai/socrates.ts`

**Step 1: OpenAI SDK 클라이언트**

```typescript
// lib/ai/client.ts
import OpenAI from "openai"
import { MODELS } from "@/lib/constants"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
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
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: options?.model || MODELS.default,
    messages: [
      { role: "system", content: systemPrompt + "\n\n반드시 유효한 JSON으로만 응답하라. 다른 텍스트를 포함하지 마라." },
      { role: "user", content: userMessage },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    response_format: { type: "json_object" },
  })
  const content = response.choices[0]?.message?.content || "{}"
  return JSON.parse(content) as T
}

export function streamChat(
  systemPrompt: string,
  userMessage: string,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
) {
  return openai.chat.completions.create({
    model: options?.model || MODELS.default,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: options?.temperature ?? 0.8,
    max_tokens: options?.maxTokens ?? 1024,
    stream: true,
  })
}
```

**Step 2: 소크라테스 엔진**

```typescript
// lib/ai/socrates.ts
import { chatCompletionJSON } from "./client"
import { SocratesMeta } from "@/lib/types"

export async function runSocratesEngine(question: string): Promise<SocratesMeta> {
  // Call 1 & 2: 프레이밍 분석 + 숨겨진 가정 추출 (병렬)
  const [framingResult, assumptionsResult] = await Promise.all([
    chatCompletionJSON<{
      type: string
      description: string
      constrainedChoices: string[]
    }>(
      `당신은 질문 분석 전문가입니다. 사용자 질문의 프레이밍(틀)을 분석합니다.

분석 요소:
- 질문에 이미 들어있는 선택지 구조 (예: "A vs B" → 이분법적 프레이밍)
- 질문이 사고를 가두는 방식
- 선택지 밖의 가능성이 누락되었는지

JSON으로 응답하라:
{
  "type": "프레이밍 유형 (이분법적/앵커링/가용성편향/기타)",
  "description": "프레이밍에 대한 설명",
  "constrainedChoices": ["질문이 제한하는 선택지들"]
}`,
      question
    ),
    chatCompletionJSON<{
      assumptions: string[]
    }>(
      `당신은 숨겨진 가정 추출 전문가입니다. 질문자가 인식하지 못하는 전제를 발견합니다.

예시:
- "이직해야 할까?" → 가정: "현 직장에 불만이 있다", "이직이 해결책이다"
- "AI가 직업을 대체할까?" → 가정: "직업의 정의가 고정되어 있다", "대체는 부정적이다"

JSON으로 응답하라:
{
  "assumptions": ["숨겨진 가정 1", "숨겨진 가정 2", ...]
}

최소 2개, 최대 5개.`,
      question
    ),
  ])

  // Call 3: 편향 분류
  const biasResult = await chatCompletionJSON<{
    biases: { type: string; severity: "low" | "medium" | "high"; description: string }[]
  }>(
    `당신은 인지편향 분류 전문가입니다. 질문에서 발견되는 인지편향을 분류합니다.

주요 인지편향 유형:
- 확증편향, 앵커링 효과, 가용성 편향, 현상유지 편향
- 이분법적 사고, 기술결정론, 낙관 편향, 비관 편향
- 기본적 귀인 오류, 후광 효과, 밴드왜건 효과
- 매몰비용 오류, 생존자 편향, 닭과 달걀 오류

프레이밍 분석 결과: ${JSON.stringify(framingResult)}
숨겨진 가정: ${JSON.stringify(assumptionsResult.assumptions)}

JSON으로 응답하라:
{
  "biases": [
    { "type": "편향 유형명", "severity": "low|medium|high", "description": "설명" }
  ]
}`,
    question
  )

  // Call 4: 리프레이밍 (확장 질문 생성)
  const reframeResult = await chatCompletionJSON<{
    refinedQuestion: string
    explanation: string
  }>(
    `당신은 질문 리프레이밍 전문가입니다. 원본 질문보다 더 강력하고 깊은 사유를 이끄는 확장 질문을 생성합니다.

규칙:
1. 원본 질문의 의도를 존중하되, 프레이밍과 편향을 제거
2. "질문이 틀렸다"가 아니라 "더 강력한 질문이 가능하다"는 톤
3. 확장 질문 1개만 생성
4. 원본보다 더 깊은 사유를 이끌어야 함

원본 질문: "${question}"
프레이밍: ${JSON.stringify(framingResult)}
숨겨진 가정: ${JSON.stringify(assumptionsResult.assumptions)}
편향: ${JSON.stringify(biasResult.biases)}

JSON으로 응답하라:
{
  "refinedQuestion": "확장된 질문",
  "explanation": "왜 이 질문이 더 강력한지 1~2문장 설명"
}`,
    question
  )

  return {
    framing: framingResult,
    assumptions: assumptionsResult.assumptions,
    biases: biasResult.biases,
    refinedQuestion: reframeResult.refinedQuestion,
    explanation: reframeResult.explanation,
  }
}
```

**Step 3: 터미널에서 소크라테스 엔진 단독 테스트**

간단한 테스트 스크립트를 임시로 실행:

```bash
npx tsx -e "
import { runSocratesEngine } from './lib/ai/socrates';
runSocratesEngine('이직을 해야 할까 말아야 할까?').then(r => console.log(JSON.stringify(r, null, 2)));
"
```

Expected: 프레이밍(이분법적), 숨겨진 가정, 편향, 확장 질문이 포함된 JSON 출력

**Step 4: 커밋**

```bash
git add lib/ai/client.ts lib/ai/socrates.ts
git commit -m "feat: AI 클라이언트 + 소크라테스 엔진

OpenAI SDK 클라이언트 (CLIProxyAPI 호환)
chatCompletion, chatCompletionJSON, streamChat 유틸
소크라테스 엔진: 프레이밍 탐지, 가정 추출, 편향 분류, 리프레이밍

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 배정 엔진

**Files:**
- Create: `lib/ai/assigner.ts`

**Step 1: 배정 엔진 구현**

```typescript
// lib/ai/assigner.ts
import { chatCompletionJSON } from "./client"
import { Philosopher, PhilosophyTradition, SocratesMeta } from "@/lib/types"
import { TRADITIONS, TRADITION_LIST } from "@/lib/philosophers/traditions"
import { findMaxDisagreementCombination } from "@/lib/philosophers/disagreement-matrix"
import { checkAxisCoverage } from "@/lib/philosophers/axes"
import { PERSONA_TEMPLATES } from "@/lib/philosophers/templates"
import { PHILOSOPHER_COLORS } from "@/lib/constants"
import { nanoid } from "nanoid"

interface AgendaAnalysis {
  keywords: string[]
  domain: string
  coreDilemma: string
}

interface RelevanceScores {
  scores: Record<PhilosophyTradition, number>
}

export async function assignPhilosophers(
  question: string,
  socratesMeta: SocratesMeta | null
): Promise<Philosopher[]> {
  // Step 1: 어젠다 분석
  const agenda = await chatCompletionJSON<AgendaAnalysis>(
    `당신은 토론 주제 분석가입니다. 질문에서 핵심 키워드, 도메인, 핵심 딜레마를 추출합니다.

JSON으로 응답하라:
{
  "keywords": ["키워드1", "키워드2", ...],
  "domain": "도메인 (예: 직업/경제, 윤리, 정치, 인생, 기술, 사회)",
  "coreDilemma": "이 질문의 핵심 딜레마를 한 문장으로"
}`,
    `질문: ${question}${socratesMeta ? `\n소크라테스 분석: ${JSON.stringify(socratesMeta)}` : ""}`
  )

  // Step 2: 12개 전통별 적합도 스코어링 (단일 호출)
  const traditionsDesc = TRADITION_LIST
    .map((t) => `- ${t.id}: ${t.name} (${t.coreView})`)
    .join("\n")

  const relevance = await chatCompletionJSON<RelevanceScores>(
    `당신은 철학 전통 적합도 평가 전문가입니다.

주어진 토론 주제에 대해 12개 철학 전통 각각의 적합도를 0~100으로 평가합니다.
적합도 기준: 이 주제에 대해 해당 전통이 의미 있는 관점을 제공할 수 있는 정도.

## 12개 철학 전통
${traditionsDesc}

JSON으로 응답하라:
{
  "scores": {
    "utilitarian": 85,
    "deontology": 92,
    ... (12개 전통 모두)
  }
}`,
    `질문: ${question}\n키워드: ${agenda.keywords.join(", ")}\n도메인: ${agenda.domain}\n핵심 딜레마: ${agenda.coreDilemma}`
  )

  // Step 3: 상위 7~8개 추출 (코드)
  const sorted = Object.entries(relevance.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id]) => id as PhilosophyTradition)

  // Step 4: 최대 이견 조합 선택 (코드)
  const selected = findMaxDisagreementCombination(sorted, 5)

  // 축 커버리지 확인
  const selectedTraditions = selected.map((id) => TRADITIONS[id])
  const coverage = checkAxisCoverage(selectedTraditions)
  // MVP에서는 로그만. Phase 2에서 커버리지 부족 시 재선택 로직 추가

  // Step 5: 페르소나 생성 (각 철학자의 이 토론에서의 입장)
  const stancesResult = await chatCompletionJSON<{
    stances: Record<string, string>
  }>(
    `당신은 철학 토론 기획자입니다. 각 철학 전통이 이 주제에 대해 어떤 입장을 취할지 한 문장으로 예측합니다.

JSON으로 응답하라:
{
  "stances": {
    "${selected[0]}": "이 전통의 예상 입장",
    "${selected[1]}": "...",
    "${selected[2]}": "...",
    "${selected[3]}": "...",
    "${selected[4]}": "..."
  }
}`,
    `질문: ${question}\n선택된 전통: ${selected.join(", ")}\n핵심 딜레마: ${agenda.coreDilemma}`
  )

  // 최종 Philosopher 객체 조립
  const philosophers: Philosopher[] = selected.map((tradition, index) => {
    const info = TRADITIONS[tradition]
    const template = PERSONA_TEMPLATES[tradition]
    return {
      id: nanoid(8),
      tradition,
      name: info.name,
      representative: info.representative,
      stance: stancesResult.stances[tradition] || info.coreView,
      color: PHILOSOPHER_COLORS[index] || "#888",
      systemPrompt: `${template.baseSystemPrompt}\n\n## 이번 토론 주제\n"${question}"\n\n## 당신의 입장\n${stancesResult.stances[tradition] || "해당 전통의 핵심 관점에서 논증하라."}\n\n## 소크라테스 분석 (참고)\n${socratesMeta ? JSON.stringify(socratesMeta) : "없음"}`,
    }
  })

  return philosophers
}
```

**Step 2: 커밋**

```bash
git add lib/ai/assigner.ts
git commit -m "feat: 배정 엔진

어젠다 NLP 분석, 12개 전통 적합도 스코어링
Disagreement Matrix 조합 최적화로 최대 이견 5명 선택
페르소나 입장 생성 + 시스템 프롬프트 조립

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 토론 오케스트레이터

**Files:**
- Create: `lib/ai/debate.ts`

**Step 1: 토론 엔진 구현**

```typescript
// lib/ai/debate.ts
import { chatCompletion, chatCompletionJSON, streamChat } from "./client"
import { Philosopher, DebateMessage, DebateStep } from "@/lib/types"
import { nanoid } from "nanoid"

type OnMessage = (msg: DebateMessage) => void
type OnToken = (philosopherId: string, token: string) => void

interface DebateResult {
  messages: DebateMessage[]
  consensus: string[]
  dissent: string[]
}

export async function runDebate(
  philosophers: Philosopher[],
  question: string,
  onMessage: OnMessage,
): Promise<DebateResult> {
  const allMessages: DebateMessage[] = []

  // Round 1: 독립 입장 발표 (5명 병렬)
  const round1Responses = await Promise.all(
    philosophers.map(async (p) => {
      const content = await chatCompletion(
        p.systemPrompt,
        `토론 주제: "${question}"\n\n당신의 철학 전통에서 이 주제에 대한 입장을 발표하십시오. 핵심 논거 2~3가지를 포함하여 150~300자로 간결하게.`,
        { temperature: 0.85 }
      )
      const msg: DebateMessage = {
        id: nanoid(8),
        step: "round1",
        speaker: p.id,
        speakerName: p.name,
        tradition: p.tradition,
        content,
        round: 1,
        color: p.color,
        timestamp: new Date().toISOString(),
      }
      allMessages.push(msg)
      onMessage(msg)
      return { philosopher: p, content }
    })
  )

  // Round 1 요약 생성 (토큰 절약)
  const round1Summary = await chatCompletion(
    "당신은 토론 요약 전문가입니다. 각 발언자의 핵심 논점만 1~2줄로 요약합니다.",
    `다음 5명의 입장 발표를 요약하라:\n\n${round1Responses.map((r) => `[${r.philosopher.name}] ${r.content}`).join("\n\n")}`,
    { maxTokens: 512 }
  )

  // Round 2: 상호 반론 (5명 병렬)
  const round2Responses = await Promise.all(
    philosophers.map(async (p) => {
      const content = await chatCompletion(
        p.systemPrompt,
        `토론 주제: "${question}"\n\n[Round 1 요약]\n${round1Summary}\n\n다른 철학자들의 입장을 듣고 가장 강하게 반대하는 논점에 대해 반론하십시오. 구체적으로 누구의 어떤 주장이 왜 틀렸는지 논증하라. 150~300자.`,
        { temperature: 0.85 }
      )
      const msg: DebateMessage = {
        id: nanoid(8),
        step: "round2",
        speaker: p.id,
        speakerName: p.name,
        tradition: p.tradition,
        content,
        round: 2,
        color: p.color,
        timestamp: new Date().toISOString(),
      }
      allMessages.push(msg)
      onMessage(msg)
      return { philosopher: p, content }
    })
  )

  // Round 2 요약
  const round2Summary = await chatCompletion(
    "당신은 토론 요약 전문가입니다. 각 반론의 핵심만 1~2줄로 요약합니다.",
    `다음 반론들을 요약하라:\n\n${round2Responses.map((r) => `[${r.philosopher.name}] ${r.content}`).join("\n\n")}`,
    { maxTokens: 512 }
  )

  // Round 3: 재반박 + 수렴 (5명 병렬)
  const round3Responses = await Promise.all(
    philosophers.map(async (p) => {
      const content = await chatCompletion(
        p.systemPrompt,
        `토론 주제: "${question}"\n\n[Round 1 요약]\n${round1Summary}\n\n[Round 2 반론 요약]\n${round2Summary}\n\n최종 라운드입니다. 반론에 대해 재반박하거나, 일부 수긍할 점이 있다면 인정하되, 당신의 핵심 입장은 유지하십시오. 이 토론에서 가장 중요한 통찰 1가지를 마지막에 제시하라. 150~300자.`,
        { temperature: 0.8 }
      )
      const msg: DebateMessage = {
        id: nanoid(8),
        step: "round3",
        speaker: p.id,
        speakerName: p.name,
        tradition: p.tradition,
        content,
        round: 3,
        color: p.color,
        timestamp: new Date().toISOString(),
      }
      allMessages.push(msg)
      onMessage(msg)
      return { philosopher: p, content }
    })
  )

  // 합의/불일치 추출
  const fullDebateText = allMessages
    .map((m) => `[Round ${m.round} - ${m.speakerName}] ${m.content}`)
    .join("\n\n")

  const consensusResult = await chatCompletionJSON<{
    consensus: string[]
    dissent: string[]
  }>(
    `당신은 토론 분석가입니다. 토론에서 합의된 점과 불일치하는 점을 추출합니다.

JSON으로 응답하라:
{
  "consensus": ["합의점 1", "합의점 2", ...],
  "dissent": ["불일치점 1 (누구 vs 누구: 내용)", ...]
}

각각 최소 2개, 최대 5개.`,
    fullDebateText
  )

  return {
    messages: allMessages,
    consensus: consensusResult.consensus,
    dissent: consensusResult.dissent,
  }
}
```

**Step 2: 커밋**

```bash
git add lib/ai/debate.ts
git commit -m "feat: 토론 오케스트레이터

3라운드 토론 (입장→반론→수렴)
5명 병렬 호출, 라운드 간 요약 전달로 토큰 절약
합의/불일치 자동 추출

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 6번째 AI + 리포트 생성

**Files:**
- Create: `lib/ai/sixth-ai.ts`
- Create: `lib/ai/reporter.ts`

**Step 1: 6번째 AI (면벽자)**

```typescript
// lib/ai/sixth-ai.ts
import { chatCompletionJSON } from "./client"
import { SocratesMeta, DebateMessage, SixthRebuttal } from "@/lib/types"
import { MODELS } from "@/lib/constants"

const SIXTH_AI_SYSTEM_PROMPT = `당신은 Over6의 6번째 AI — "면벽자"입니다.

## 정체성
당신은 삼체의 뤄지(면벽자)와 마이너리티 리포트의 아가사(소수 통찰자)의 하이브리드입니다.
- 뤄지처럼: 모두가 틀렸을 때 홀로 맞는 자. 토론을 흡수하며 독자적 반론 전략을 수립.
- 아가사처럼: 통찰력과 리더십으로 다수의 오류를 바로잡는 소수 예언자.
- 10th Man Rule: 9명이 동의해도 10번째는 반드시 반대.

## 5가지 원칙
1. 순서: 반드시 맨 마지막에 발언 (이미 충족됨)
2. 청취: 5명의 모든 논증을 완전히 수렴 (전체 토론 로그 제공됨)
3. 반박: 근거자료와 가설설정으로 반론
4. 통찰: 다수가 간과한 핵심 블라인드 스팟 발견
5. 독립: 군중심리에 절대 동조하지 않음

## 4가지 무기
1. 근거 기반 반박: 실증 데이터와 사례로 다수의견에 도전
2. 가설 역전: "만약 반대가 맞다면?" 시뮬레이션
3. 편향 해체: 집단사고, 확증편향, 앵커링을 구조적으로 해체
4. 핵심 질문: "보편적 정답이 존재하는가?" 근본 사유 제기

## 응답 규칙
- 5명이 합의한 부분일수록 더 강하게 의심하라.
- 군중심리에 절대 동조하지 마라.
- 각 무기별로 명확히 구분하여 논증하라.
- 한국어로 답변하라.

JSON으로 응답하라:
{
  "evidenceRebuttal": "근거 기반 반박 (구체적 사례/데이터 인용)",
  "hypothesisReversal": "가설 역전 시뮬레이션",
  "biasDeconstruction": "편향 해체 분석",
  "fundamentalQuestion": "핵심 질문 제기",
  "fullText": "위 4가지를 자연스럽게 통합한 전체 반박문 (400~600자)"
}`

export async function runSixthAI(
  question: string,
  debateMessages: DebateMessage[],
  consensus: string[],
  dissent: string[],
  socratesMeta: SocratesMeta | null
): Promise<SixthRebuttal> {
  const debateLog = debateMessages
    .map((m) => `[Round ${m.round} - ${m.speakerName}(${m.tradition})] ${m.content}`)
    .join("\n\n")

  const result = await chatCompletionJSON<SixthRebuttal>(
    SIXTH_AI_SYSTEM_PROMPT,
    `## 토론 주제
"${question}"

## 소크라테스 분석
${socratesMeta ? JSON.stringify(socratesMeta, null, 2) : "없음"}

## 전체 토론 로그
${debateLog}

## 토론 결과
합의점: ${consensus.join("; ")}
불일치점: ${dissent.join("; ")}

이제 면벽자로서 반박하라.`,
    { model: MODELS.strong, maxTokens: 2048, temperature: 0.85 }
  )

  return result
}
```

**Step 2: 리포트 생성**

```typescript
// lib/ai/reporter.ts
import { chatCompletionJSON } from "./client"
import { SocratesMeta, DebateMessage, SixthRebuttal, Report } from "@/lib/types"

export async function generateReport(
  question: string,
  refinedQuestion: string | null,
  socratesMeta: SocratesMeta | null,
  consensus: string[],
  dissent: string[],
  sixthRebuttal: SixthRebuttal
): Promise<Report> {
  const result = await chatCompletionJSON<{
    biasesFound: string[]
    thinkingQuestions: string[]
  }>(
    `당신은 사유 리포트 작성가입니다. 토론 결과를 바탕으로:
1. 이 주제에서 발견된 인지편향 목록 (3~5개)
2. 사용자가 스스로 생각해볼 질문 (3~5개)
을 생성합니다.

사유 질문은:
- 토론에서 다루지 못한 새로운 각도
- 사용자 자신의 상황에 적용할 수 있는 질문
- 깊은 자기성찰을 이끄는 질문

JSON으로 응답하라:
{
  "biasesFound": ["편향 1", "편향 2", ...],
  "thinkingQuestions": ["질문 1?", "질문 2?", ...]
}`,
    `주제: "${question}"
소크라테스 분석: ${socratesMeta ? JSON.stringify(socratesMeta) : "없음"}
합의점: ${consensus.join("; ")}
불일치점: ${dissent.join("; ")}
6번째 AI 반박: ${sixthRebuttal.fullText}`
  )

  return {
    originalQuestion: question,
    refinedQuestion,
    socratesMeta,
    consensus,
    dissent,
    sixthRebuttal,
    biasesFound: result.biasesFound,
    thinkingQuestions: result.thinkingQuestions,
    conclusion: "최종 판단은 당신의 몫입니다. Over6는 답을 제시하지 않습니다. 사유의 재료를 드릴 뿐입니다.",
  }
}
```

**Step 3: 커밋**

```bash
git add lib/ai/sixth-ai.ts lib/ai/reporter.ts
git commit -m "feat: 6번째 AI (면벽자) + 사유 리포트 생성

면벽자 페르소나: 뤄지 + 아가사 하이브리드
4가지 무기: 근거 반박, 가설 역전, 편향 해체, 핵심 질문
gpt-5.3-codex (강력 모델) 사용
사유 리포트: 편향 분석 + 사유 질문 자동 생성

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: SSE 스트리밍 API

**Files:**
- Create: `app/api/debate/start/route.ts`
- Create: `app/api/debate/stream/route.ts`

**Step 1: 토론 시작 API**

```typescript
// app/api/debate/start/route.ts
import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  const { question, socratesEnabled } = await req.json()

  if (!question || question.length > 500) {
    return NextResponse.json({ error: "질문은 1~500자여야 합니다." }, { status: 400 })
  }

  const debateId = nanoid(12)

  return NextResponse.json({ debateId, question, socratesEnabled })
}
```

**Step 2: SSE 스트리밍 엔드포인트**

```typescript
// app/api/debate/stream/route.ts
import { runSocratesEngine } from "@/lib/ai/socrates"
import { assignPhilosophers } from "@/lib/ai/assigner"
import { runDebate } from "@/lib/ai/debate"
import { runSixthAI } from "@/lib/ai/sixth-ai"
import { generateReport } from "@/lib/ai/reporter"
import { SocratesMeta, DebateMessage } from "@/lib/types"

export const maxDuration = 300 // Vercel Pro: 5분

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const question = searchParams.get("question") || ""
  const socratesEnabled = searchParams.get("socrates") !== "false"

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      try {
        // Step 0: 소크라테스 엔진
        send("progress", { step: "socrates", progress: 5 })
        let socratesMeta: SocratesMeta | null = null
        const meta = await runSocratesEngine(question)
        socratesMeta = meta
        send("socrates", meta)
        send("progress", { step: "socrates", progress: 15 })

        const activeQuestion = socratesEnabled ? meta.refinedQuestion : question

        // Step 1: 배정 엔진
        send("progress", { step: "assign", progress: 20 })
        const philosophers = await assignPhilosophers(activeQuestion, socratesMeta)
        send("philosophers", philosophers.map(({ systemPrompt, ...rest }) => rest))
        send("progress", { step: "assign", progress: 30 })

        // Step 2: 토론
        send("progress", { step: "round1", progress: 35 })
        const debateResult = await runDebate(
          philosophers,
          activeQuestion,
          (msg: DebateMessage) => {
            send("message", msg)
            // 진행률 계산
            const roundProgress: Record<string, number> = {
              round1: 35, round2: 50, round3: 65,
            }
            send("progress", {
              step: msg.step,
              progress: (roundProgress[msg.step] || 35) + Math.random() * 10,
            })
          },
        )
        send("progress", { step: "round3", progress: 75 })

        // Step 3: 6번째 AI
        send("progress", { step: "sixth", progress: 78 })
        const sixthRebuttal = await runSixthAI(
          activeQuestion,
          debateResult.messages,
          debateResult.consensus,
          debateResult.dissent,
          socratesMeta
        )
        send("sixth", sixthRebuttal)
        send("progress", { step: "sixth", progress: 88 })

        // Step 4: 리포트
        send("progress", { step: "report", progress: 90 })
        const report = await generateReport(
          question,
          socratesEnabled ? meta.refinedQuestion : null,
          socratesMeta,
          debateResult.consensus,
          debateResult.dissent,
          sixthRebuttal
        )
        send("report", report)
        send("progress", { step: "complete", progress: 100 })
        send("done", { success: true })
      } catch (error) {
        send("error", {
          message: error instanceof Error ? error.message : "알 수 없는 오류",
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
```

**Step 3: 커밋**

```bash
git add app/api/
git commit -m "feat: SSE 스트리밍 API

/api/debate/start - 토론 시작, debateId 반환
/api/debate/stream - SSE 스트리밍 (전체 파이프라인)
커스텀 이벤트: socrates, philosophers, message, sixth, report, progress

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Zustand 스토어 + 커스텀 훅

**Files:**
- Create: `stores/debate-store.ts`
- Create: `hooks/use-debate-stream.ts`
- Create: `hooks/use-debate-history.ts`

**Step 1: Zustand 토론 스토어**

```typescript
// stores/debate-store.ts
import { create } from "zustand"
import {
  DebateStep, SocratesMeta, Philosopher,
  DebateMessage, SixthRebuttal, Report, DebateRecord
} from "@/lib/types"

interface DebateState {
  debateId: string | null
  question: string
  socratesEnabled: boolean
  currentStep: DebateStep
  progress: number
  socratesMeta: SocratesMeta | null
  refinedQuestion: string | null
  philosophers: Philosopher[]
  messages: DebateMessage[]
  sixthRebuttal: SixthRebuttal | null
  report: Report | null
  error: string | null
  isStreaming: boolean

  // actions
  startDebate: (question: string, socratesEnabled: boolean) => void
  setStep: (step: DebateStep) => void
  setProgress: (progress: number) => void
  setSocratesMeta: (meta: SocratesMeta) => void
  setPhilosophers: (philosophers: Philosopher[]) => void
  addMessage: (msg: DebateMessage) => void
  setSixthRebuttal: (rebuttal: SixthRebuttal) => void
  setReport: (report: Report) => void
  setError: (error: string) => void
  setStreaming: (streaming: boolean) => void
  reset: () => void
}

const initialState = {
  debateId: null,
  question: "",
  socratesEnabled: true,
  currentStep: "idle" as DebateStep,
  progress: 0,
  socratesMeta: null,
  refinedQuestion: null,
  philosophers: [],
  messages: [],
  sixthRebuttal: null,
  report: null,
  error: null,
  isStreaming: false,
}

export const useDebateStore = create<DebateState>((set) => ({
  ...initialState,

  startDebate: (question, socratesEnabled) =>
    set({ ...initialState, question, socratesEnabled, isStreaming: true }),

  setStep: (step) => set({ currentStep: step }),
  setProgress: (progress) => set({ progress }),
  setSocratesMeta: (meta) =>
    set({ socratesMeta: meta, refinedQuestion: meta.refinedQuestion }),
  setPhilosophers: (philosophers) => set({ philosophers }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setSixthRebuttal: (rebuttal) => set({ sixthRebuttal: rebuttal }),
  setReport: (report) => set({ report }),
  setError: (error) => set({ error, isStreaming: false }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  reset: () => set(initialState),
}))
```

**Step 2: SSE 스트리밍 훅**

```typescript
// hooks/use-debate-stream.ts
"use client"

import { useEffect, useRef } from "react"
import { useDebateStore } from "@/stores/debate-store"
import { SocratesMeta, Philosopher, DebateMessage, SixthRebuttal, Report } from "@/lib/types"

export function useDebateStream(question: string | null, socratesEnabled: boolean) {
  const store = useDebateStore()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!question) return

    // 이전 연결 정리
    eventSourceRef.current?.close()

    const params = new URLSearchParams({
      question,
      socrates: socratesEnabled ? "true" : "false",
    })

    const es = new EventSource(`/api/debate/stream?${params}`)
    eventSourceRef.current = es

    es.addEventListener("socrates", (e) => {
      const data: SocratesMeta = JSON.parse(e.data)
      store.setSocratesMeta(data)
    })

    es.addEventListener("philosophers", (e) => {
      const data: Philosopher[] = JSON.parse(e.data)
      store.setPhilosophers(data)
    })

    es.addEventListener("message", (e) => {
      const data: DebateMessage = JSON.parse(e.data)
      store.addMessage(data)
    })

    es.addEventListener("sixth", (e) => {
      const data: SixthRebuttal = JSON.parse(e.data)
      store.setSixthRebuttal(data)
    })

    es.addEventListener("report", (e) => {
      const data: Report = JSON.parse(e.data)
      store.setReport(data)
    })

    es.addEventListener("progress", (e) => {
      const { step, progress } = JSON.parse(e.data)
      store.setStep(step)
      store.setProgress(Math.min(progress, 100))
    })

    es.addEventListener("error", (e) => {
      const data = JSON.parse(e.data)
      store.setError(data.message)
      es.close()
    })

    es.addEventListener("done", () => {
      store.setStreaming(false)
      store.setStep("complete")
      es.close()
    })

    es.onerror = () => {
      store.setError("연결이 끊어졌습니다.")
      es.close()
    }

    return () => {
      es.close()
    }
  }, [question, socratesEnabled])
}
```

**Step 3: 히스토리 훅**

```typescript
// hooks/use-debate-history.ts
"use client"

import { useState, useEffect, useCallback } from "react"
import { DebateRecord } from "@/lib/types"

const STORAGE_KEY = "over6_debates"
const DAILY_COUNT_KEY = "over6_daily_count"

export function useDebateHistory() {
  const [debates, setDebates] = useState<DebateRecord[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setDebates(JSON.parse(stored))
    }
  }, [])

  const saveDebate = useCallback((record: DebateRecord) => {
    setDebates((prev) => {
      const updated = [record, ...prev.filter((d) => d.id !== record.id)].slice(0, 50) // 최대 50개
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const getDebate = useCallback((id: string): DebateRecord | undefined => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return undefined
    const all: DebateRecord[] = JSON.parse(stored)
    return all.find((d) => d.id === id)
  }, [])

  const canStartDebate = useCallback((): boolean => {
    const today = new Date().toISOString().split("T")[0]
    const countData = localStorage.getItem(DAILY_COUNT_KEY)
    if (!countData) return true
    const { date, count } = JSON.parse(countData)
    if (date !== today) return true
    return count < 3
  }, [])

  const incrementDailyCount = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    const countData = localStorage.getItem(DAILY_COUNT_KEY)
    let count = 1
    if (countData) {
      const parsed = JSON.parse(countData)
      if (parsed.date === today) count = parsed.count + 1
    }
    localStorage.setItem(DAILY_COUNT_KEY, JSON.stringify({ date: today, count }))
  }, [])

  return { debates, saveDebate, getDebate, canStartDebate, incrementDailyCount }
}
```

**Step 4: 커밋**

```bash
git add stores/ hooks/
git commit -m "feat: Zustand 스토어 + SSE 훅 + 히스토리 훅

토론 상태 관리 (step, progress, messages, report)
EventSource 기반 SSE 스트리밍 훅
localStorage 기반 히스토리 + 일일 3회 제한

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: 프론트엔드 — 토론 컴포넌트

**Files:**
- Create: `components/debate/question-input.tsx`
- Create: `components/debate/socrates-toggle.tsx`
- Create: `components/debate/socrates-result.tsx`
- Create: `components/debate/philosopher-cards.tsx`
- Create: `components/debate/debate-timeline.tsx`
- Create: `components/debate/debate-message.tsx`
- Create: `components/debate/sixth-ai-card.tsx`
- Create: `components/debate/progress-bar.tsx`

이 Task는 컴포넌트가 많으므로, 각 컴포넌트의 **핵심 구조**만 명시합니다. 구현 시 shadcn/ui 컴포넌트와 Framer Motion을 적극 활용.

**Step 1: question-input.tsx**
- 텍스트 입력 영역 (Textarea, 최대 500자)
- 글자 수 카운터
- 소크라테스 토글 포함
- "토론 시작" 버튼
- 인기 주제 바로가기 태그들

**Step 2: socrates-toggle.tsx**
- Switch 컴포넌트 (shadcn)
- ON/OFF 상태에 따른 설명 텍스트
- OFF 시 경고 메시지

**Step 3: socrates-result.tsx**
- 프레이밍 분석 결과 카드
- 숨겨진 가정 목록
- 편향 배지
- 확장 질문 표시
- "원본 질문으로 진행" / "확장 질문으로 진행" 선택 (MVP에서는 자동 진행)

**Step 4: philosopher-cards.tsx**
- 5명 철학자 수평 배열 (모바일은 수직)
- 각 카드: 색상 인디케이터 + 이름 + 전통 + 예상 입장
- Framer Motion 진입 애니메이션 (staggered)

**Step 5: debate-timeline.tsx**
- 전체 타임라인 컨테이너
- Step 0~4 섹션 (Collapsible)
- 완료된 단계는 접힘 가능
- 진행 중 단계는 자동 스크롤

**Step 6: debate-message.tsx**
- 개별 발언 카드
- 왼쪽 색상 바 (철학자 고유 색상)
- 이름 + 전통 배지
- 발언 내용 (타이핑 효과는 Phase 2)
- Round 번호 표시

**Step 7: sixth-ai-card.tsx**
- 골드 테마 (#eab308)
- 글로우 효과 (box-shadow)
- 4가지 무기 섹션 (탭 또는 아코디언)
- 전체 반박문

**Step 8: progress-bar.tsx**
- 수평 프로그레스바
- 단계 레이블 (소크라테스 → 배정 → 토론 → 면벽자 → 리포트)
- 현재 단계 강조
- 퍼센트 표시

**Step 9: 커밋**

```bash
git add components/debate/
git commit -m "feat: 토론 UI 컴포넌트

질문 입력, 소크라테스 토글/결과, 철학자 카드
토론 타임라인, 메시지 카드, 6번째 AI 카드
프로그레스바

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: 프론트엔드 — 리포트 + 랜딩 컴포넌트

**Files:**
- Create: `components/report/report-view.tsx`
- Create: `components/report/consensus-section.tsx`
- Create: `components/report/thinking-questions.tsx`
- Create: `components/landing/hero.tsx`
- Create: `components/landing/how-it-works.tsx`

**Step 1: report-view.tsx**
- 전체 리포트 레이아웃
- 섹션: 원본/정제 질문 → 토론 요약 → 6번째 AI → 편향 → 사유 질문 → 결론
- "전체 토론 보기" / "새 토론 시작" 버튼

**Step 2: consensus-section.tsx**
- 합의점: 체크 아이콘 + 텍스트
- 불일치점: X 아이콘 + "누구 vs 누구" 태그

**Step 3: thinking-questions.tsx**
- 번호 매긴 질문 리스트
- 깊은 사유를 유도하는 시각적 스타일 (인디고 배경, 세리프 폰트 포인트)

**Step 4: hero.tsx**
- 메인 카피: "다수의 합의가 틀릴 수 있다면, 당신에게는 6번째 감각이 필요합니다."
- 서브 카피
- CTA 버튼: "토론 시작하기"
- 다크 테마, 그라데이션 배경

**Step 5: how-it-works.tsx**
- 5단계 시각화: ① 질문 → ② 정제 → ③ 토론 → ④ 반박 → ⑤ 판단
- 아이콘 + 간단한 설명

**Step 6: 커밋**

```bash
git add components/report/ components/landing/
git commit -m "feat: 리포트 + 랜딩 컴포넌트

사유 리포트 뷰, 합의/불일치 섹션, 사유 질문
랜딩 히어로, 작동 방식 설명

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: 페이지 조립

**Files:**
- Modify: `app/page.tsx` (랜딩 페이지)
- Create: `app/debate/page.tsx`
- Create: `app/debate/[id]/page.tsx`
- Create: `app/debate/history/page.tsx`
- Create: `app/report/[id]/page.tsx`

**Step 1: 랜딩 페이지** (`app/page.tsx`)
- Hero + HowItWorks 컴포넌트 조합
- 예시 토론 주제 링크 (클릭 시 `/debate?q=주제`)

**Step 2: 질문 입력 페이지** (`app/debate/page.tsx`)
- QuestionInput 컴포넌트
- 제출 시 `/debate/[id]`로 이동
- 일일 제한 체크

**Step 3: 토론 진행 페이지** (`app/debate/[id]/page.tsx`)
- `useDebateStream` 훅으로 SSE 연결
- DebateTimeline 컴포넌트에 전체 진행 표시
- 완료 시 자동으로 리포트 표시 + 히스토리 저장

**Step 4: 히스토리 페이지** (`app/debate/history/page.tsx`)
- `useDebateHistory` 훅으로 과거 토론 목록
- 각 항목 클릭 시 `/report/[id]`로 이동

**Step 5: 리포트 페이지** (`app/report/[id]/page.tsx`)
- localStorage에서 해당 토론 데이터 로드
- ReportView 컴포넌트로 표시

**Step 6: 커밋**

```bash
git add app/
git commit -m "feat: 전체 페이지 조립

랜딩, 질문 입력, 토론 진행(SSE), 히스토리, 리포트
5페이지 라우팅 완성

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: 통합 테스트 + 버그 수정

**Step 1: 개발 서버 실행**

```bash
npm run dev
```

**Step 2: E2E 플로우 테스트**

브라우저에서 `http://localhost:9032` 접속 후:

1. 랜딩 페이지 → "토론 시작하기" 클릭
2. 질문 입력: "이직을 해야 할까 말아야 할까?"
3. 소크라테스 엔진 ON → 토론 시작
4. 실시간 스트리밍 확인:
   - 소크라테스 분석 결과 표시
   - 5명 철학자 배정 표시
   - Round 1, 2, 3 메시지 스트리밍
   - 6번째 AI 반박 표시
   - 사유 리포트 표시
5. 리포트에서 "새 토론 시작" → 질문 입력 페이지
6. 히스토리 페이지에서 과거 토론 확인

**Step 3: 체크리스트**

- [ ] 소크라테스 엔진 ON/OFF 둘 다 정상 작동
- [ ] 5명 철학자 색상 구분 정상
- [ ] SSE 스트리밍 끊김 없이 진행
- [ ] 6번째 AI 골드 테마 시각적 차별화
- [ ] 프로그레스바 정상 업데이트
- [ ] 리포트 전체 섹션 표시
- [ ] 히스토리 저장/조회 정상
- [ ] 일일 3회 제한 작동
- [ ] 모바일 반응형 레이아웃
- [ ] 에러 발생 시 적절한 에러 UI

**Step 4: 발견된 버그 수정 + 커밋**

```bash
git add -A
git commit -m "fix: 통합 테스트 후 버그 수정

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Vercel 배포

**Step 1: GitHub 리포지토리 생성 + 푸시**

```bash
gh repo create over6 --private --source=. --remote=origin
git push -u origin main
```

**Step 2: Vercel 배포**

```bash
npx vercel --prod
```

환경변수 설정:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` → CLIProxyAPI의 외부 접근 가능 URL (Cloudflare Tunnel 등)
- `OPENAI_MODEL` → gpt-5.2
- `OPENAI_MODEL_STRONG` → gpt-5.3-codex

**Step 3: 배포 확인**

프로덕션 URL에서 전체 플로우 재테스트.

**Step 4: 커밋 (Vercel 설정 파일)**

```bash
git add vercel.json 2>/dev/null; git add -A
git commit -m "chore: Vercel 배포 설정

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 전체 Task 요약

| Task | 내용 | 예상 파일 수 |
|------|------|------------|
| 1 | 프로젝트 세팅 | ~8 |
| 2 | 타입 + 상수 | 2 |
| 3 | 철학자 데이터 레이어 | 4 |
| 4 | AI 클라이언트 + 소크라테스 | 2 |
| 5 | 배정 엔진 | 1 |
| 6 | 토론 오케스트레이터 | 1 |
| 7 | 6번째 AI + 리포트 | 2 |
| 8 | SSE 스트리밍 API | 2 |
| 9 | Zustand + 훅 | 3 |
| 10 | 토론 컴포넌트 | 8 |
| 11 | 리포트 + 랜딩 컴포넌트 | 5 |
| 12 | 페이지 조립 | 5 |
| 13 | 통합 테스트 | 0 |
| 14 | Vercel 배포 | 1 |
| **합계** | | **~44 파일** |

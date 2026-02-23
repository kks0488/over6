# Over6 MVP Design Document
**Date:** 2026-02-23
**Status:** Approved

---

## 1. 프로젝트 개요

Over6는 "제도화된 반대자" 개념을 AI로 구현한 멀티 에이전트 철학 토론 플랫폼.
5명의 철학자 AI가 토론하고, 6번째 AI가 다수의 오류를 반박하고, 최종 판단은 인간이 내린다.

## 2. 핵심 결정

| 항목 | 결정 |
|------|------|
| MVP 타겟 | 개인 의사결정 + 사회적 난제 둘 다 |
| LLM | CLIProxyAPI (gpt-5.2 / gpt-5.3-codex) |
| 백엔드 | Next.js 풀스택 (Python 없음) |
| 인증/결제 | 제외 (핵심 기능 먼저) |
| UI | 실시간 SSE 스트리밍 |
| 배포 | Vercel |
| DB | MVP는 localStorage, Phase 2에서 Supabase |
| 포트 | 9032 |

---

## 3. 시스템 아키텍처

**접근 방식:** Monolith Streaming — Next.js 단일 앱에서 API Routes로 전체 파이프라인 처리.

```
┌─────────────────────────────────────────────────────┐
│              Next.js 15 App (Vercel)                 │
│                                                      │
│  ┌──────────────┐    ┌────────────────────────────┐ │
│  │  Frontend     │    │  API Routes                 │ │
│  │  - React 19   │───→│  /api/debate/start          │ │
│  │  - Zustand    │←SSE│  /api/debate/stream         │ │
│  │  - Framer     │    │                             │ │
│  └──────────────┘    └──────────┬─────────────────┘ │
│                                  │                    │
│                     ┌────────────▼─────────────────┐ │
│                     │  AI Orchestration (lib/)      │ │
│                     │  socrates → assigner →        │ │
│                     │  debate → sixth-ai → reporter │ │
│                     └──────────┬─────────────────┘  │
└────────────────────────────────┼─────────────────────┘
                                 │ OpenAI SDK
                    ┌────────────▼──────────────┐
                    │  CLIProxyAPI (localhost:8317) │
                    │  gpt-5.2 / gpt-5.3-codex   │
                    └─────────────────────────────┘
```

---

## 4. 토론 파이프라인 데이터 플로우

```
사용자 질문 입력
       │
       ▼
[POST /api/debate/start] → debateId 반환
[GET  /api/debate/stream?id=] → SSE 연결
       │
       ├─→ Step 0: socratesEngine(question)
       │   ├─ 프레이밍 탐지 + 숨겨진 가정 추출 (병렬)
       │   ├─ 편향 분류
       │   └─ 리프레이밍 생성
       │   → SSE event: socrates
       │
       ├─→ Step 1: assignPhilosophers(question, meta)
       │   ├─ 어젠다 NLP 분석
       │   ├─ 12개 전통 적합도 스코어링 (단일 호출)
       │   ├─ Top 7~8 필터링 (코드)
       │   ├─ Disagreement Matrix 조합 최적화 (코드)
       │   └─ 페르소나 시스템 프롬프트 생성
       │   → SSE event: philosophers
       │
       ├─→ Step 2: runDebate(philosophers, question)
       │   ├─ Round 1: 5명 병렬 입장 발표
       │   ├─ 요약 생성
       │   ├─ Round 2: 5명 병렬 상호 반론
       │   ├─ 요약 생성
       │   ├─ Round 3: 5명 병렬 재반박 + 수렴
       │   └─ 합의/불일치 추출
       │   → SSE event: message (각 발언마다)
       │
       ├─→ Step 3: sixthAI(debateLog, meta)
       │   ├─ 전체 토론 컨텍스트 입력
       │   └─ 면벽자 반박 생성 (gpt-5.3-codex)
       │   → SSE event: sixth
       │
       └─→ Step 4: generateReport(all)
           → SSE event: report
           → localStorage 저장
```

---

## 5. AI 오케스트레이션 상세

### Step 0: 소크라테스 엔진
- 4회 LLM 호출 (병렬 최적화 시 3~4초)
- Call 1,2 병렬: analyzeFraming + extractAssumptions
- Call 3 직렬: classifyBias
- Call 4 직렬: reframe
- ON: 사용자에게 분석 결과 + 확장 질문 표시, 선택 후 진행
- OFF: 원본 질문 그대로, 백그라운드 메타는 후속 에이전트에 전달

### Step 1: 배정 엔진
- 3회 LLM + 2회 코드 로직 (3~5초)
- 12개 철학 전통 풀 (서양 6, 동양 4, 현대 2)
- Disagreement Matrix: 12x12 하드코딩 상수
- 조합 최적화: C(8,5)=56개 중 이견 총합 최대
- 배정 3원칙: 축 커버리지, 주제 적합성, 최대 이견 보장

### Step 2: 다자 토론
- 18회 LLM 호출 (병렬 처리로 15~20초)
- Round 1: 5명 병렬 입장 발표
- Round 2: 요약 후 5명 병렬 반론
- Round 3: 요약 후 5명 병렬 재반박
- 다양성 보장: 시스템 프롬프트에 강한 독립성 지시

### Step 3: 6번째 AI
- 1회 LLM 호출 (5~8초, gpt-5.3-codex)
- 면벽자 + 아가사 하이브리드 페르소나
- 4가지 무기: 근거 반박, 가설 역전, 편향 해체, 핵심 질문
- RAG는 Phase 2 (MVP는 LLM 지식만)

### Step 4: 사유 리포트
- 1회 LLM 호출 (3~5초)
- 구조: 토론 요약 → 6번째 반박 → 편향 분석 → 사유 질문
- "최종 판단은 당신의 몫입니다"

### 전체 요약
| Step | LLM 호출 | 소요 시간 | 모델 |
|------|---------|----------|------|
| Step 0 | 4회 | 3~4초 | gpt-5.2 |
| Step 1 | 3회 | 3~5초 | gpt-5.2 |
| Step 2 | 18회 | 15~20초 | gpt-5.2 |
| Step 3 | 1회 | 5~8초 | gpt-5.3-codex |
| Step 4 | 1회 | 3~5초 | gpt-5.2 |
| **합계** | **27회** | **~30~40초** | **$0 (CLIProxyAPI)** |

---

## 6. 데이터 모델

### MVP: localStorage

```typescript
interface DebateRecord {
  id: string
  question: string
  refinedQuestion: string | null
  socratesMeta: SocratesMeta
  philosophers: Philosopher[]
  messages: DebateMessage[]
  sixthRebuttal: SixthRebuttal
  report: Report
  createdAt: string
}
```

### Phase 2: Supabase

```sql
debates (
  id UUID PK,
  user_id UUID FK,
  question TEXT,
  refined_question TEXT,
  socrates_meta JSONB,
  philosophers JSONB,
  debate_log JSONB,
  sixth_ai_rebuttal JSONB,
  report JSONB,
  status TEXT,
  created_at TIMESTAMPTZ
)

debate_messages (
  id UUID PK,
  debate_id UUID FK,
  step TEXT,
  speaker TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
)
```

---

## 7. 프론트엔드 UI/UX

### 페이지 구조 (5페이지)
- `/` — 랜딩 페이지
- `/debate` — 질문 입력
- `/debate/[id]` — 토론 진행 (실시간 스트리밍) **핵심 화면**
- `/debate/history` — 과거 토론 목록
- `/report/[id]` — 사유 리포트 전체 보기

### 토론 진행 화면 핵심 원칙
- 타임라인형 레이아웃: Step 0→1→2→3→4 순차 스크롤
- 실시간 스트리밍: 글자 단위 타이핑 애니메이션
- 색상 구분: 5명 고유 색상 (에메랄드, 블루, 앰버, 로즈, 바이올렛)
- 6번째 AI: 골드 #f59e0b, 글로우 효과로 시각적 차별화
- 진행률: 프로그레스바로 전체 파이프라인 위치 표시
- 자동 스크롤: 새 발언 시 부드러운 스크롤

### 디자인 톤
- 다크 모드 기본 (배경 #0a0a0a, 카드 #1a1a1a)
- 강조색: 인디고 #6366f1
- 폰트: Pretendard + Inter
- 애니메이션: Framer Motion

### 상태 관리
- Zustand: 토론 진행 상태, 메시지, 리포트
- SSE: EventSource로 실시간 수신, 커스텀 이벤트 타입별 핸들링

### 사용량 제한 (인증 없이)
- 일일 토론 3회
- localStorage + 쿠키 기반

---

## 8. 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Framework | Next.js 15, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Animation | Framer Motion 11 |
| State | Zustand 5 |
| AI | OpenAI SDK 4 → CLIProxyAPI |
| Icons | Lucide React |
| ID | nanoid |
| Deploy | Vercel |

---

## 9. 디렉토리 구조

```
over6/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # 랜딩
│   ├── debate/
│   │   ├── page.tsx                  # 질문 입력
│   │   ├── [id]/page.tsx             # 토론 진행
│   │   └── history/page.tsx          # 히스토리
│   ├── report/[id]/page.tsx          # 리포트
│   └── api/debate/
│       ├── start/route.ts
│       └── stream/route.ts
├── lib/
│   ├── ai/
│   │   ├── client.ts                 # OpenAI SDK 클라이언트
│   │   ├── socrates.ts
│   │   ├── assigner.ts
│   │   ├── debate.ts
│   │   ├── sixth-ai.ts
│   │   └── reporter.ts
│   ├── philosophers/
│   │   ├── traditions.ts
│   │   ├── templates.ts
│   │   ├── disagreement-matrix.ts
│   │   └── axes.ts
│   ├── types.ts
│   └── constants.ts
├── components/
│   ├── ui/                           # shadcn/ui
│   ├── debate/
│   │   ├── question-input.tsx
│   │   ├── socrates-toggle.tsx
│   │   ├── socrates-result.tsx
│   │   ├── philosopher-cards.tsx
│   │   ├── debate-timeline.tsx
│   │   ├── debate-message.tsx
│   │   ├── sixth-ai-card.tsx
│   │   └── progress-bar.tsx
│   ├── report/
│   │   ├── report-view.tsx
│   │   ├── consensus-section.tsx
│   │   └── thinking-questions.tsx
│   └── landing/
│       ├── hero.tsx
│       └── how-it-works.tsx
├── hooks/
│   ├── use-debate-stream.ts
│   └── use-debate-history.ts
├── stores/
│   └── debate-store.ts
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 10. MVP 스코프 제외 (Phase 2+)

| 기능 | Phase |
|------|-------|
| 인증 (Supabase Auth) | 2 |
| 결제 (토스페이먼츠) | 2 |
| RAG 근거 검색 (pgvector) | 2 |
| 편향 프로파일링 | 2 |
| 학습형 질문 정제 | 2 |
| 공유/내보내기 (PDF) | 2 |
| 모바일 앱 | 3 |
| 다국어 | 4 |
| B2B / API 공개 | 3 |

---

## 11. 환경변수

```env
OPENAI_API_KEY=<from global.env>
OPENAI_BASE_URL=http://localhost:8317/v1
OPENAI_MODEL=gpt-5.2
OPENAI_MODEL_STRONG=gpt-5.3-codex
NEXT_PUBLIC_APP_URL=http://localhost:9032
PORT=9032
```

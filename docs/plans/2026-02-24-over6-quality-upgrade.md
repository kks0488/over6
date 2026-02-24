# Over6 철학 토론 품질 강화 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 결론 고도화, 소크라테스 질문 수정 기능, 철학자 자기비판을 구현하여 토론 품질을 근본적으로 강화한다.

**Architecture:** (1) reporter.ts의 하드코딩된 결론을 LLM 동적 생성으로 교체, (2) SocratesOptions UI에 질문 수정(edit) 기능 추가, (3) 라운드 2-3 프롬프트에 자기비판 규칙 삽입. 모두 기존 API 구조를 유지하면서 프롬프트/UI 레벨 변경.

**Tech Stack:** Next.js 15, React 19, TypeScript, Framer Motion, OpenAI SDK (via CLIProxyAPI)

---

## Task 1: 결론 동적 생성 — reporter.ts 수정

**배경:** 현재 `reporter.ts:117`에 `conclusion: "최종 판단은 당신의 몫입니다."` 하드코딩. 사용자가 직접 불만 제기. GPT 리뷰도 "충분하지 않다" 지적.

**목표:** LLM이 토론 내용 기반으로 구조화된 동적 결론을 생성. 각 주요 입장별 강점/약점/불확실성을 정리하고, 빠진 관점을 구체적으로 제시.

**Files:**
- Modify: `lib/ai/reporter.ts:9-54` (ReportInsights 인터페이스 + generateInsights 프롬프트)
- Modify: `lib/ai/reporter.ts:89-119` (generateReport 함수)
- Modify: `lib/types.ts:77-89` (Report 인터페이스 — conclusion 타입 변경)
- Modify: `components/report/report-view.tsx:157-165` (결론 렌더링 섹션)

### Step 1: Report 타입 변경

`lib/types.ts:77-89`에서 `conclusion` 필드를 string에서 구조체로 변경:

```typescript
export interface ReportConclusion {
  /** 토론에서 드러난 핵심 쟁점별 입장 요약 (2~4개) */
  positions: {
    position: string
    strengths: string
    weaknesses: string
    uncertainty: string
  }[]
  /** 이 토론에서 탐색하지 못한 중요한 방향 2~3개 */
  unexploredDirections: string[]
  /** 독자에게 전하는 성찰 메시지 (2~3문장, "판단은 당신의 몫" 식이 아닌 구체적 안내) */
  reflectionNote: string
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
  missingPerspectives: string[]
  uncertaintyNote: string
  conclusion: ReportConclusion
}
```

### Step 2: generateInsights 프롬프트에 conclusion 추가

`lib/ai/reporter.ts` — ReportInsights 인터페이스에 `conclusion` 필드 추가하고, 시스템 프롬프트의 JSON 스키마에 아래 추가:

```
5. conclusion: 토론 결론 (구조화된 형태)
   - positions: 토론에서 드러난 핵심 쟁점별 입장 정리 (2~4개)
     각 position은:
     - position: 입장 이름 (예: "공리주의적 접근", "의무론적 반대")
     - strengths: 이 입장의 강점 (1문장)
     - weaknesses: 이 입장의 약점 또는 한계 (1문장)
     - uncertainty: 이 입장에서 확실하지 않은 부분 (1문장)
   - unexploredDirections: 이 토론에서 다루지 못했지만 중요한 탐색 방향 2~3개 (각 1문장)
   - reflectionNote: 독자에게 전하는 성찰 안내 (2~3문장)
     - "최종 판단은 당신의 몫"이 아닌, 구체적으로 어떤 요소를 고려해야 하는지 안내
     - 어떤 조건에서 어떤 입장이 더 설득력 있는지 힌트 제공
     - 독자의 개인적 맥락(가치관, 상황, 우선순위)이 판단에 어떻게 영향을 미치는지 언급
```

JSON 스키마에 추가:
```json
{
  "conclusion": {
    "positions": [
      {
        "position": "입장 이름",
        "strengths": "강점",
        "weaknesses": "약점",
        "uncertainty": "불확실한 부분"
      }
    ],
    "unexploredDirections": ["방향1", "방향2"],
    "reflectionNote": "성찰 안내 메시지"
  }
}
```

### Step 3: generateReport에서 conclusion 연결

`lib/ai/reporter.ts:89-119` — 하드코딩된 `conclusion: "최종 판단은 당신의 몫입니다."`를 `insights.conclusion`으로 교체:

```typescript
return {
  originalQuestion: question,
  refinedQuestion: socratesMeta?.refinedQuestion ?? null,
  socratesMeta,
  consensus,
  dissent,
  sixthRebuttal,
  biasesFound: insights.biasesFound,
  thinkingQuestions: insights.thinkingQuestions,
  missingPerspectives: insights.missingPerspectives,
  uncertaintyNote: insights.uncertaintyNote,
  conclusion: insights.conclusion,
}
```

### Step 4: report-view.tsx 결론 렌더링 업데이트

`components/report/report-view.tsx:157-165` — 현재 단순 텍스트 → 구조화된 카드:

```tsx
{/* Conclusion */}
<section className="space-y-4">
  <h3 className="text-lg font-bold text-zinc-100">결론</h3>

  {/* Position cards */}
  <div className="space-y-3">
    {report.conclusion.positions.map((pos, i) => (
      <div
        key={i}
        className="rounded-lg border border-zinc-700/50 bg-[#1a1a1a] p-4 space-y-2"
      >
        <h4 className="text-sm font-semibold text-zinc-200">{pos.position}</h4>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md bg-emerald-500/5 p-2.5">
            <p className="text-xs font-medium text-emerald-400">강점</p>
            <p className="mt-1 text-xs text-zinc-300">{pos.strengths}</p>
          </div>
          <div className="rounded-md bg-rose-500/5 p-2.5">
            <p className="text-xs font-medium text-rose-400">약점</p>
            <p className="mt-1 text-xs text-zinc-300">{pos.weaknesses}</p>
          </div>
          <div className="rounded-md bg-amber-500/5 p-2.5">
            <p className="text-xs font-medium text-amber-400">불확실성</p>
            <p className="mt-1 text-xs text-zinc-300">{pos.uncertainty}</p>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Unexplored directions */}
  {report.conclusion.unexploredDirections.length > 0 && (
    <div className="rounded-lg border border-zinc-700/30 bg-zinc-800/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
        더 탐색해볼 방향
      </p>
      <ul className="space-y-1.5">
        {report.conclusion.unexploredDirections.map((dir, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <span className="mt-0.5 text-indigo-400">→</span>
            {dir}
          </li>
        ))}
      </ul>
    </div>
  )}

  {/* Reflection note */}
  <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-4">
    <p className="text-sm leading-relaxed text-indigo-200/90">
      {report.conclusion.reflectionNote}
    </p>
  </div>
</section>
```

### Step 5: 하위 호환성 처리

`components/report/report-view.tsx` — 기존 localStorage에 저장된 `conclusion: string` 형태와의 호환:

결론 섹션 렌더링 상단에 타입 분기:

```tsx
{typeof report.conclusion === "string" ? (
  <div className="rounded-lg bg-[#1a1a1a] p-5">
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
      {report.conclusion}
    </p>
  </div>
) : (
  /* 새 구조화된 결론 렌더링 */
)}
```

### Step 6: 커밋

```bash
git add lib/types.ts lib/ai/reporter.ts components/report/report-view.tsx
git commit -m "feat: 결론을 동적 구조화 생성으로 전환 — 입장별 강점/약점/불확실성 + 성찰 안내"
```

---

## Task 2: 소크라테스 질문 수정(편집) 기능

**배경:** 현재 소크라테스 옵션은 3가지 재구성 질문 중 선택만 가능. 사용자가 직접 질문을 수정할 수 없음. 사용자 요청: "선택만 가능인데 수정도 가능하게 해야해"

**목표:** 각 옵션 선택 후 텍스트를 직접 수정할 수 있게. 또는 "직접 입력" 옵션 추가.

**Files:**
- Modify: `components/debate/socrates-options.tsx` (전체 재작성)
- Modify: `app/debate/page.tsx:90-106` (handleOptionSelect — 수정된 질문 전달)

### Step 1: SocratesOptions에 수정 기능 추가

`components/debate/socrates-options.tsx` — 선택된 옵션의 질문 텍스트를 `<textarea>`로 편집 가능하게:

**핵심 변경:**
1. 옵션 선택 시 → 해당 질문 텍스트가 편집 가능한 textarea에 로드
2. 사용자가 자유롭게 수정 가능
3. "원래 질문 그대로" 선택 시에도 원래 질문 텍스트를 편집 가능
4. `onSelect` 콜백에 최종 확정된 질문 텍스트를 전달

**상태 추가:**
```typescript
const [editedQuestion, setEditedQuestion] = useState("")  // 현재 편집 중인 질문 텍스트
```

**선택 시 동작:**
```typescript
function handleOptionClick(index: number) {
  setSelectedIndex(index)
  if (index === -1) {
    setEditedQuestion(originalQuestion)
  } else {
    setEditedQuestion(analysis.options[index].refinedQuestion)
  }
}
```

**UI 변경 — 선택된 옵션 아래에 편집 영역 표시:**
```tsx
{selectedIndex !== null && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    className="space-y-2"
  >
    <p className="text-xs font-medium text-zinc-500">
      질문을 자유롭게 수정할 수 있습니다
    </p>
    <textarea
      value={editedQuestion}
      onChange={(e) => setEditedQuestion(e.target.value)}
      rows={3}
      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 resize-none"
      placeholder="토론에 사용할 질문을 입력하세요..."
    />
  </motion.div>
)}
```

**onSelect 호출 변경:**
```typescript
onClick={() => {
  if (selectedIndex === null) return
  if (selectedIndex === -1) {
    // 원래 질문(수정했을 수도 있음) — editedQuestion 사용
    onSelect(null, editedQuestion)
  } else {
    const option = analysis.options[selectedIndex]
    // 수정된 질문으로 option 복사
    onSelect({ ...option, refinedQuestion: editedQuestion }, editedQuestion)
  }
}}
```

### Step 2: onSelect 콜백 시그니처 변경

`components/debate/socrates-options.tsx` props 타입:

```typescript
interface SocratesOptionsProps {
  analysis: SocratesAnalysisResult
  originalQuestion: string
  onSelect: (option: SocratesOption | null, finalQuestion?: string) => void
}
```

### Step 3: debate/page.tsx handleOptionSelect 업데이트

`app/debate/page.tsx:90-106` — `finalQuestion` 파라미터 수신:

```typescript
function handleOptionSelect(option: SocratesOption | null, finalQuestion?: string) {
  if (!socratesAnalysis) return
  setPhase("starting")

  if (option === null) {
    // 원래 질문 사용 (수정됐을 수 있음)
    if (finalQuestion && finalQuestion !== pendingQuestion) {
      // 사용자가 원래 질문을 수정한 경우 — socratesMeta 없이 수정된 질문으로
      startDebateWithParams(finalQuestion, null)
    } else {
      startDebateWithParams(pendingQuestion, null)
    }
  } else {
    const meta: SocratesMeta = {
      framing: socratesAnalysis.framing,
      assumptions: socratesAnalysis.assumptions,
      biases: socratesAnalysis.biases,
      refinedQuestion: option.refinedQuestion, // 이미 편집된 텍스트가 들어옴
      explanation: option.explanation,
    }
    // question 파라미터는 원래 질문 유지 (meta.refinedQuestion이 실제 사용됨)
    startDebateWithParams(pendingQuestion, meta)
  }
}
```

### Step 4: 커밋

```bash
git add components/debate/socrates-options.tsx app/debate/page.tsx
git commit -m "feat: 소크라테스 질문 수정 기능 — 선택 후 자유 편집 가능"
```

---

## Task 3: 철학자 자기비판 라운드 2 삽입

**배경:** GPT 리뷰 P2-1: "각 철학자에게 자기 비판 1문장 강제 — 캐리커처가 크게 줄어듦". 현재 라운드 3에만 "네 입장의 가장 큰 약점을 인정하라" 규칙이 있고, 라운드 2에는 없음.

**목표:** 라운드 2 프롬프트에도 자기비판 요소를 추가하여, 일찍부터 균형 잡힌 논증이 나오게 함.

**Files:**
- Modify: `app/api/debate/round/route.ts:54-68` (round 2 프롬프트)
- Modify: `lib/ai/debate.ts:57-72` (round 2 프롬프트 — 백업용, route에서 직접 사용)

### Step 1: round/route.ts 라운드 2 프롬프트 수정

`app/api/debate/round/route.ts:54-68` — 라운드 2 `buildUserPrompt`의 round === 2 분기:

기존:
```
이제 다른 철학자들의 논점을 직접 반박하라.
- 가장 반대되는 입장 1~2명을 지명하여 구체적으로 반박하라.
- 네 전통의 강점으로 상대의 약점을 공격하라.
- 새로운 논거를 추가하라.
```

변경:
```
이제 다른 철학자들의 논점을 직접 반박하라.
- 가장 반대되는 입장 1~2명을 지명하여 구체적으로 반박하라.
- 네 전통의 강점으로 상대의 약점을 공격하라.
- 새로운 논거를 추가하라.
- 단, 반박하기 전에 먼저 네 자신의 입장에서 가장 취약한 지점 한 가지를 솔직히 인정하라. 자기 비판은 지적 정직성의 표현이다.
```

### Step 2: lib/ai/debate.ts 동기화 (backup)

`lib/ai/debate.ts:57-72` — 같은 변경 적용 (이 파일은 직접 호출되지 않으나 코드 일관성 유지):

동일하게 round 2 프롬프트에 자기비판 줄 추가.

### Step 3: 커밋

```bash
git add app/api/debate/round/route.ts lib/ai/debate.ts
git commit -m "feat: 라운드 2에 자기비판 규칙 추가 — 반박 전 취약점 인정"
```

---

## Task 4: 빌드 검증 및 통합 테스트

**목표:** 타입 변경 후 빌드 깨짐 없는지 확인, 브라우저에서 전체 플로우 동작 검증.

**Files:** 없음 (검증만)

### Step 1: TypeScript 빌드 확인

```bash
cd /home/kkaemo/projects/over6
npx next build 2>&1 | head -50
```

- `Report` 타입이 변경되었으므로, `report.conclusion`을 직접 렌더링하는 모든 곳이 호환되는지 확인
- 특히 `app/community/[id]/page.tsx`, `app/report/[id]/page.tsx`에서 ReportView에 report를 전달하는 부분

### Step 2: 하위 호환 확인 포인트

- `app/community/[id]/page.tsx` — DB에서 가져온 report의 conclusion이 string일 수 있음 → Step 5 호환성 처리로 커버
- `app/report/[id]/page.tsx` — localStorage에서 가져온 report의 conclusion이 string일 수 있음 → 동일
- `hooks/use-debate-history.ts` — DebateRecord.report가 Report | null이고, Report.conclusion 타입이 바뀜 → 직접 접근하지 않으므로 OK

### Step 3: 빌드 에러 수정 (있다면)

Report.conclusion 타입을 union으로 변경하여 하위 호환:

```typescript
conclusion: ReportConclusion | string  // string은 하위 호환용
```

### Step 4: 최종 커밋 및 배포

```bash
git add -A
git commit -m "fix: 타입 호환성 수정"
git push origin main
```

---

## 변경 범위 요약

| 파일 | 변경 유형 | Task |
|------|----------|------|
| `lib/types.ts` | 수정 (ReportConclusion 추가, Report.conclusion 타입 변경) | 1 |
| `lib/ai/reporter.ts` | 수정 (프롬프트 확장, conclusion 동적 생성) | 1 |
| `components/report/report-view.tsx` | 수정 (결론 구조화 렌더링 + 하위 호환) | 1 |
| `components/debate/socrates-options.tsx` | 수정 (편집 textarea 추가, onSelect 시그니처 변경) | 2 |
| `app/debate/page.tsx` | 수정 (handleOptionSelect 파라미터 추가) | 2 |
| `app/api/debate/round/route.ts` | 수정 (라운드 2 자기비판 프롬프트) | 3 |
| `lib/ai/debate.ts` | 수정 (라운드 2 자기비판 프롬프트 동기화) | 3 |

**총 7개 파일 수정, 새 파일 없음.**

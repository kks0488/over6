#!/bin/bash
# Over6 전체 토론 파이프라인 실행 스크립트
# Usage: ./scripts/run-debate.sh "질문"

set -e

BASE="http://localhost:9032"
QUESTION="$1"
OUTPUT_DIR="/tmp/over6-debates"
mkdir -p "$OUTPUT_DIR"

SLUG=$(echo "$QUESTION" | head -c 20 | sed 's/[^가-힣a-zA-Z0-9]/_/g')
DEBATE_DIR="$OUTPUT_DIR/$SLUG-$(date +%s)"
mkdir -p "$DEBATE_DIR"

echo "=========================================="
echo "Over6 토론 시작: $QUESTION"
echo "출력 디렉토리: $DEBATE_DIR"
echo "=========================================="

# Step 1: 배정
echo ""
echo "[Step 1/6] 철학자 배정 중..."
curl -s -X POST "$BASE/api/debate/assign" \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"$QUESTION\", \"socratesMeta\": null}" \
  --max-time 60 > "$DEBATE_DIR/01-assign.json"

jq -r '.philosophers[] | "  - \(.name) (\(.representative)) [\(.tradition)]"' "$DEBATE_DIR/01-assign.json"

# Step 2: 라운드 1
echo ""
echo "[Step 2/6] 라운드 1 — 독립 입장 발표..."
jq -c '{
  question: "'"$QUESTION"'",
  round: 1,
  serverState: .serverState,
  socratesMeta: null,
  previousMessages: [],
  previousSummary: null
}' "$DEBATE_DIR/01-assign.json" | \
curl -s -X POST "$BASE/api/debate/round" \
  -H "Content-Type: application/json" \
  -d @- \
  --max-time 300 > "$DEBATE_DIR/02-round1.json"

echo "  라운드 1 완료 ($(jq '.messages | length' "$DEBATE_DIR/02-round1.json")명 발언)"

# 누적 메시지 파일 생성
jq -c '.messages' "$DEBATE_DIR/02-round1.json" > "$DEBATE_DIR/messages-cumulative.json"

# Step 3: 라운드 2
echo ""
echo "[Step 3/6] 라운드 2 — 상호 반박..."

# 라운드 2 요청 페이로드를 파일로 구성
jq -c --arg q "$QUESTION" --slurpfile prev "$DEBATE_DIR/messages-cumulative.json" '{
  question: $q,
  round: 2,
  serverState: .serverState,
  socratesMeta: null,
  previousMessages: $prev[0],
  previousSummary: input.summary
}' "$DEBATE_DIR/01-assign.json" "$DEBATE_DIR/02-round1.json" | \
curl -s -X POST "$BASE/api/debate/round" \
  -H "Content-Type: application/json" \
  -d @- \
  --max-time 300 > "$DEBATE_DIR/03-round2.json"

echo "  라운드 2 완료"

# 누적 메시지 업데이트
jq -c -s '.[0] + .[1]' \
  "$DEBATE_DIR/messages-cumulative.json" \
  <(jq -c '.messages' "$DEBATE_DIR/03-round2.json") \
  > "$DEBATE_DIR/messages-cumulative-tmp.json"
mv "$DEBATE_DIR/messages-cumulative-tmp.json" "$DEBATE_DIR/messages-cumulative.json"

# Step 4: 라운드 3
echo ""
echo "[Step 4/6] 라운드 3 — 최종 라운드..."

jq -c --arg q "$QUESTION" --slurpfile prev "$DEBATE_DIR/messages-cumulative.json" '{
  question: $q,
  round: 3,
  serverState: .serverState,
  socratesMeta: null,
  previousMessages: $prev[0],
  previousSummary: input.summary
}' "$DEBATE_DIR/01-assign.json" "$DEBATE_DIR/03-round2.json" | \
curl -s -X POST "$BASE/api/debate/round" \
  -H "Content-Type: application/json" \
  -d @- \
  --max-time 300 > "$DEBATE_DIR/04-round3.json"

echo "  라운드 3 완료"

# 누적 메시지 최종
jq -c -s '.[0] + .[1]' \
  "$DEBATE_DIR/messages-cumulative.json" \
  <(jq -c '.messages' "$DEBATE_DIR/04-round3.json") \
  > "$DEBATE_DIR/messages-cumulative-tmp.json"
mv "$DEBATE_DIR/messages-cumulative-tmp.json" "$DEBATE_DIR/messages-cumulative.json"

CONSENSUS=$(jq -c '.consensus' "$DEBATE_DIR/04-round3.json")
DISSENT=$(jq -c '.dissent' "$DEBATE_DIR/04-round3.json")

# Step 5: 면벽자
echo ""
echo "[Step 5/6] 면벽자 분석 중..."

jq -c --arg q "$QUESTION" '{
  question: $q,
  messages: .,
  socratesMeta: null
}' "$DEBATE_DIR/messages-cumulative.json" | \
curl -s -X POST "$BASE/api/debate/sixth" \
  -H "Content-Type: application/json" \
  -d @- \
  --max-time 300 > "$DEBATE_DIR/05-sixth.json"

echo "  면벽자 분석 완료"

# Step 6: 리포트
echo ""
echo "[Step 6/6] 리포트 생성 중..."

jq -c --arg q "$QUESTION" \
  --slurpfile msgs "$DEBATE_DIR/messages-cumulative.json" \
  --slurpfile sixth "$DEBATE_DIR/05-sixth.json" \
  --argjson consensus "$CONSENSUS" \
  --argjson dissent "$DISSENT" \
  '{
    question: $q,
    messages: $msgs[0],
    socratesMeta: null,
    sixthRebuttal: $sixth[0],
    consensus: $consensus,
    dissent: $dissent
  }' <<< 'null' | \
curl -s -X POST "$BASE/api/debate/report" \
  -H "Content-Type: application/json" \
  -d @- \
  --max-time 300 > "$DEBATE_DIR/06-report.json"

echo "  리포트 완료"

echo ""
echo "=========================================="
echo "토론 완료!"
echo "결과: $DEBATE_DIR/"
ls -la "$DEBATE_DIR/"
echo "=========================================="

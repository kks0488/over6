export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-5xl font-bold tracking-tight">Over6</h1>
      <p className="mt-4 text-lg text-zinc-400">
        5명의 철학자가 토론하고, 6번째 AI가 반박하고, 당신이 결정합니다.
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-zinc-600">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        시스템 준비 완료
      </div>
    </div>
  )
}

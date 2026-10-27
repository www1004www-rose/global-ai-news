import { connection } from "next/server";
import { Suspense } from "react";
import NewsList, { formatDate, ModeBadge } from "@/components/NewsList";
import { hasApiKey } from "@/lib/refresh";
import { SOURCES } from "@/lib/sources";
import { readNews } from "@/lib/storage";
import RefreshButton from "./RefreshButton";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <Suspense fallback={<p className="text-muted">불러오는 중…</p>}>
        <NewsSection />
      </Suspense>
    </main>
  );
}

async function NewsSection() {
  await connection();
  const data = await readNews();
  const keyPresent = hasApiKey();

  return (
    <>
      <header className="mb-10 border-b border-line pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-coral">
          {SOURCES.map((s) => s.name).join(" · ")} · Daily Five
        </p>
        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              오늘 읽을 기술 뉴스
            </h1>
            {data ? (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>{formatDate(data.generatedAt, true)} 갱신</span>
                <ModeBadge mode={data.mode} />
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted">아직 가져온 기사가 없습니다.</p>
            )}
          </div>
          <RefreshButton />
        </div>
      </header>

      {!keyPresent && (
        <p className="mb-8 rounded-2xl border border-line bg-peach px-5 py-4 text-sm leading-6">
          API 키가 없어 최신 영어 기사 5건을 보여 줍니다. <code className="font-mono text-coral-deep">.env.local</code>에{" "}
          <code className="font-mono text-coral-deep">ANTHROPIC_API_KEY</code>를 넣으면 AI가 기사를 골라 한국어로 요약합니다.
        </p>
      )}

      {data?.failedSources && (
        <p className="mb-8 rounded-2xl border border-line bg-peach px-5 py-4 text-sm leading-6 text-coral-deep">
          {data.failedSources.join(", ")} RSS를 가져오지 못해 나머지 출처의 기사로만 골랐습니다.
        </p>
      )}

      {data ? (
        <NewsList data={data} />
      ) : (
        <p className="rounded-2xl border border-dashed border-line px-4 py-16 text-center text-muted">
          오른쪽 위 <strong className="text-coral-deep">새로 가져오기</strong>를 눌러 주세요.
        </p>
      )}
    </>
  );
}

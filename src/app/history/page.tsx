import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import NewsList, { formatDate, ModeBadge } from "@/components/NewsList";
import { BACKUP_DAYS, TIME_ZONE } from "@/lib/config";
import { listBackupDates, readBackup } from "@/lib/storage";

export const metadata: Metadata = {
  title: "지난 기록 · 와이어드 AI 추천 뉴스",
};

// "2026-10-27" → { day: "10월 27일", weekday: "화" }
function dateLabel(date: string) {
  const d = new Date(`${date}T12:00:00+09:00`);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("ko-KR", { timeZone: TIME_ZONE, ...opts }).format(d);
  return { day: fmt({ month: "long", day: "numeric" }), weekday: fmt({ weekday: "short" }) };
}

export default function HistoryPage({ searchParams }: PageProps<"/history">) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <Suspense fallback={<p className="text-muted">불러오는 중…</p>}>
        <HistorySection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function HistorySection({ searchParams }: Pick<PageProps<"/history">, "searchParams">) {
  await connection();
  const dates = await listBackupDates();
  const requested = (await searchParams).date;
  const selected =
    typeof requested === "string" && dates.includes(requested) ? requested : dates[0];
  const data = selected ? await readBackup(selected) : null;

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-coral">Archive</p>
        <h1 className="mt-3 font-serif text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          지난 기록
        </h1>
        <p className="mt-3 text-sm text-muted">
          날짜별로 마지막에 고른 5건을 최근 {BACKUP_DAYS}일치까지 보관합니다.
        </p>
      </header>

      {dates.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-16 text-center text-muted">
          아직 저장된 기록이 없습니다. 홈에서 <strong className="text-coral-deep">새로 가져오기</strong>를 눌러 주세요.
        </p>
      ) : (
        <>
          <nav aria-label="날짜 선택" className="-mx-4 mb-8 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <ul className="flex gap-2">
              {dates.map((date) => {
                const { day, weekday } = dateLabel(date);
                const active = date === selected;
                return (
                  <li key={date} className="shrink-0">
                    <Link
                      href={`/history?date=${date}`}
                      aria-current={active ? "page" : undefined}
                      className={`flex flex-col items-center rounded-2xl px-4 py-2.5 text-sm ring-1 transition ${
                        active
                          ? "bg-coral text-white ring-coral dark:text-[#1a1210]"
                          : "bg-peach ring-line hover:bg-peach-strong"
                      }`}
                    >
                      <span className="font-bold">{day}</span>
                      <span className={`text-xs ${active ? "opacity-80" : "text-muted"}`}>{weekday}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {data ? (
            <section>
              <p className="mb-5 flex flex-wrap items-center gap-2 border-b border-line pb-4 text-sm text-muted">
                <span>{formatDate(data.generatedAt, true)} 저장</span>
                <ModeBadge mode={data.mode} />
              </p>
              <NewsList data={data} />
            </section>
          ) : (
            <p className="text-muted">이 날짜의 기록을 읽지 못했습니다.</p>
          )}
        </>
      )}
    </>
  );
}

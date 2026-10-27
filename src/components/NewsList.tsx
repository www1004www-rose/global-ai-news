import Image from "next/image";
import { TIME_ZONE } from "@/lib/config";
import { IMAGE_PREFIXES } from "@/lib/sources";
import type { NewsData, NewsItem } from "@/lib/types";

export function formatDate(iso: string | null, withTime = false) {
  if (!iso) return "날짜 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(iso));
}

export function ModeBadge({ mode }: { mode: NewsData["mode"] }) {
  return (
    <span className="rounded-full bg-peach-strong px-2.5 py-0.5 text-xs font-medium text-coral-deep">
      {mode === "ai" ? "AI 선정" : "최신 기사 · 영어"}
    </span>
  );
}

// 카테고리 "Business / Artificial Intelligence" → "Artificial Intelligence"
function categoryLabel(item: NewsItem) {
  const detailed = item.categories.find((c) => c.includes("/")) ?? item.categories[0];
  return detailed?.split("/").pop()?.trim();
}

export default function NewsList({ data }: { data: NewsData }) {
  return (
    <ol className="flex flex-col gap-5">
      {data.items.map((item) => (
        <li key={item.link}>
          <Card item={item} ai={data.mode === "ai"} />
        </li>
      ))}
    </ol>
  );
}

function Card({ item, ai }: { item: NewsItem; ai: boolean }) {
  const label = categoryLabel(item);
  // next.config의 remotePatterns에 허용한 주소만 쓴다
  const image =
    item.imageUrl && IMAGE_PREFIXES.some((p) => item.imageUrl!.startsWith(p)) ? item.imageUrl : null;
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-peach ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(242,107,85,0.35)]">
      {image && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-[16/9] overflow-hidden bg-peach-strong"
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            priority={item.rank === 1}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </a>
      )}
      <div className="flex flex-col gap-3 p-6 sm:flex-row sm:gap-7 sm:p-8">
        <span className="w-11 shrink-0 font-serif text-4xl font-black leading-none tabular-nums text-coral sm:w-16 sm:text-5xl">
          {String(item.rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          {(item.source || label) && (
            <p className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-coral-deep">
              {item.source && (
                <span className="rounded-md bg-coral px-1.5 py-0.5 tracking-[0.1em] text-white dark:text-[#1a1210]">
                  {item.source}
                </span>
              )}
              {label}
            </p>
          )}
          <h2 className="font-serif text-xl font-bold leading-snug sm:text-2xl">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="decoration-coral decoration-2 underline-offset-4 hover:underline"
            >
              {ai ? item.titleKo : item.titleEn}
            </a>
          </h2>
          {ai && <p className="mt-1.5 text-sm italic text-muted">{item.titleEn}</p>}

          <p className="mt-4 leading-7">{ai ? item.summaryKo : item.descriptionEn}</p>

          {ai && item.reasonKo && (
            <div className="mt-5 rounded-2xl bg-background/70 px-4 py-3 text-sm leading-6 ring-1 ring-line">
              <span className="mr-1.5 font-bold text-coral-deep">선정 이유</span>
              {item.reasonKo}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted">
            <time dateTime={item.publishedAt ?? undefined}>{formatDate(item.publishedAt)}</time>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-coral-deep transition-colors hover:text-coral"
            >
              원문 읽기
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

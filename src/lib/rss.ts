import Parser from "rss-parser";
import { DEAL_CATEGORY_WORDS, DEAL_LINK_PATTERNS, DEAL_TITLE_PATTERNS } from "./config";
import { SOURCES, type Source } from "./sources";
import type { Article } from "./types";

type CustomItem = {
  // RSS(WIRED): <media:thumbnail url="..."/>
  thumbnail?: { $?: { url?: string } };
  // Atom(The Verge): <category term="..."/>
  atomCategories?: { $?: { term?: string } }[];
  summary?: string;
};

const parser = new Parser<Record<string, never>, CustomItem>({
  timeout: 15000,
  customFields: {
    item: [
      ["media:thumbnail", "thumbnail"],
      ["category", "atomCategories", { keepArray: true }],
    ],
  },
});

// rss-parser는 카테고리를 문자열 또는 { _: "값" } 객체로 줄 수 있다
function toCategoryList(item: Parser.Item & CustomItem): string[] {
  const raw: unknown[] = item.categories ?? item.atomCategories?.map((c) => c.$?.term) ?? [];
  return raw
    .map((c) => (typeof c === "string" ? c : (c as { _?: string })?._ ?? ""))
    .map((c) => c.trim())
    .filter(Boolean);
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

// 소개문의 HTML 태그·엔티티와 끝의 "[…]"를 걷어 낸다
function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s*\[…\]\s*$/, "…")
    .replace(/\s+/g, " ")
    .trim();
}

// 썸네일: <media:thumbnail>가 없으면 본문 첫 <img>를 쓴다. 쿼리스트링은 뺀다.
function findImage(item: Parser.Item & CustomItem, source: Source): string | null {
  const raw =
    item.thumbnail?.$?.url ?? item.content?.match(/<img[^>]+src="([^"]+)"/i)?.[1]?.replace(/&#0?38;|&amp;/g, "&");
  if (!raw) return null;
  const url = raw.trim().split("?")[0];
  return url.startsWith(source.imagePrefix) ? url : null;
}

export function isDealArticle(article: Pick<Article, "titleEn" | "link" | "categories">): boolean {
  const categoryHit = article.categories.some((category) =>
    category
      .toLowerCase()
      .split("/")
      .map((part) => part.trim())
      .some((part) => DEAL_CATEGORY_WORDS.includes(part)),
  );
  if (categoryHit) return true;
  if (DEAL_LINK_PATTERNS.some((p) => p.test(article.link))) return true;
  return DEAL_TITLE_PATTERNS.some((p) => p.test(article.titleEn));
}

function byNewest(a: Article, b: Article) {
  return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
}

async function fetchSource(source: Source): Promise<Article[]> {
  const feed = await parser.parseURL(source.url);

  return feed.items
    .filter((item) => item.title && item.link)
    .map((item): Article => {
      const date = item.isoDate ?? item.pubDate;
      const time = date ? new Date(date) : null;
      // Atom의 content는 본문 전체라서 summary를 먼저 쓴다
      const intro = item.summary ?? item.contentSnippet ?? item.content ?? "";
      return {
        source: source.name,
        titleEn: cleanText(item.title!),
        descriptionEn: cleanText(intro),
        link: item.link!.trim(),
        publishedAt: time && !isNaN(time.getTime()) ? time.toISOString() : null,
        categories: toCategoryList(item),
        imageUrl: findImage(item, source),
      };
    })
    .filter((a) => !isDealArticle(a))
    .sort(byNewest);
}

export type FetchResult = { articles: Article[][]; failed: string[] };

// 출처별로 가져온다. 한 곳이 실패해도 나머지로 진행한다.
export async function fetchAllSources(): Promise<FetchResult> {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const articles: Article[][] = [];
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") articles.push(r.value);
    else {
      failed.push(SOURCES[i].name);
      console.error(`[rss] ${SOURCES[i].name}`, r.reason);
    }
  });
  return { articles, failed };
}

// 출처마다 고르게 나눠 담고, 모자란 자리는 남은 기사 중 최신순으로 채운다
export function pickCandidates(lists: Article[][], total: number): Article[] {
  const quota = Math.ceil(total / Math.max(lists.length, 1));
  const picked = lists.flatMap((list) => list.slice(0, quota));
  const rest = lists.flatMap((list) => list.slice(quota)).sort(byNewest);
  return [...picked, ...rest].slice(0, total).sort(byNewest);
}

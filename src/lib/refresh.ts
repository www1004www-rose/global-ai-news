import { CANDIDATE_COUNT, MODEL, PICK_COUNT } from "./config";
import { fetchAllSources, pickCandidates } from "./rss";
import { selectWithClaude } from "./select";
import { saveNews } from "./storage";
import type { NewsData } from "./types";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

let running: Promise<NewsData> | null = null;

// 수집 → 필터 → 선정 → 저장. 동시에 여러 번 눌러도 한 번만 실행한다.
export function refreshNews(): Promise<NewsData> {
  running ??= runRefresh().finally(() => {
    running = null;
  });
  return running;
}

async function runRefresh(): Promise<NewsData> {
  const { articles, failed } = await fetchAllSources();
  if (articles.length === 0) {
    throw new Error(`RSS를 하나도 가져오지 못했습니다: ${failed.join(", ")}`);
  }

  const candidates = pickCandidates(articles, CANDIDATE_COUNT);
  if (candidates.length === 0) {
    throw new Error("할인 기사를 뺀 뒤 남은 기사가 없습니다.");
  }

  const base = {
    generatedAt: new Date().toISOString(),
    ...(failed.length > 0 ? { failedSources: failed } : {}),
  };
  const data: NewsData = hasApiKey()
    ? { ...base, mode: "ai", model: MODEL, items: await selectWithClaude(candidates) }
    : {
        ...base,
        mode: "fallback",
        model: null,
        items: candidates.slice(0, PICK_COUNT).map((a, i) => ({ ...a, rank: i + 1 })),
      };

  await saveNews(data);
  return data;
}

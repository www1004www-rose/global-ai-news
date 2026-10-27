// 기사 수집 → 선정 → data/ 저장을 한 번 실행한다. GitHub Actions의 매일 갱신에서 쓴다.
// 실행: npm run refresh  (ANTHROPIC_API_KEY가 없으면 영어 최신 5건으로 저장)
import { refreshNews } from "../src/lib/refresh";

async function main() {
  const data = await refreshNews();
  console.log(`[refresh] ${data.mode} 모드, ${data.items.length}건 저장 (${data.generatedAt})`);
  if (data.failedSources) {
    console.warn(`[refresh] 가져오지 못한 출처: ${data.failedSources.join(", ")}`);
  }
  for (const item of data.items) {
    console.log(`  ${item.rank}. [${item.source ?? "?"}] ${item.titleKo ?? item.titleEn}`);
  }
}

main().catch((error) => {
  console.error("[refresh] 실패:", (error as Error).message);
  process.exit(1);
});

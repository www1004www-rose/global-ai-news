import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { MODEL, PICK_COUNT } from "./config";
import type { Article, NewsItem } from "./types";

const SelectionSchema = z.object({
  picks: z.array(
    z.object({
      index: z.number().int(),
      titleKo: z.string(),
      summaryKo: z.string(),
      reasonKo: z.string(),
    }),
  ),
});

const SYSTEM_PROMPT = `당신은 한국 대학생 독자를 위해 해외 기술 뉴스를 고르는 편집자입니다.
후보 기사 목록에서 대학생이 관심 가질 만한 AI 관련 기사 ${PICK_COUNT}건을 고르세요.

선정 기준:
- AI(인공지능, 생성형 AI, AI 에이전트, AI 기업·정책 등)를 직접 다루는 기사를 우선합니다.
- 그중에서도 대학생의 공부·과제, 진로와 취업, 일상에서 쓰는 AI 서비스, AI 윤리·저작권·개인정보처럼 대학생에게 와닿는 주제를 우선합니다.
- 비슷한 주제가 겹치지 않도록 다양하게 고르세요. 같은 사건을 두 출처가 다뤘다면 하나만 고릅니다.
- AI 기사가 ${PICK_COUNT}건보다 적으면, 나머지는 대학생이 관심 가질 만한 기술 기사로 채웁니다.

각 기사마다 다음을 한국어로 작성합니다.
- titleKo: 자연스러운 한국어 제목
- summaryKo: 2~3문장 요약
- reasonKo: 대학생에게 왜 의미 있는 기사인지 1~2문장

중요: 요약은 후보에 주어진 "소개문"에 있는 내용만 근거로 씁니다. 소개문에 없는 사실, 숫자, 인물, 배경 설명을 덧붙이지 마세요.
index에는 후보 번호를 그대로 적고, 같은 번호를 두 번 고르지 마세요.`;

function formatCandidates(articles: Article[]): string {
  return articles
    .map((a, i) =>
      [
        `[${i}]`,
        `출처: ${a.source ?? "(알 수 없음)"}`,
        `제목: ${a.titleEn}`,
        `소개문: ${a.descriptionEn || "(없음)"}`,
        `카테고리: ${a.categories.join(", ") || "(없음)"}`,
        `발행일: ${a.publishedAt ?? "(알 수 없음)"}`,
      ].join("\n"),
    )
    .join("\n\n");
}

export async function selectWithClaude(articles: Article[]): Promise<NewsItem[]> {
  const pickCount = Math.min(PICK_COUNT, articles.length);
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `후보 기사 ${articles.length}건입니다. 이 중 ${pickCount}건을 고르세요.\n\n${formatCandidates(articles)}`,
      },
    ],
    output_config: { format: zodOutputFormat(SelectionSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude가 요청을 거절했습니다.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude 응답이 길이 제한으로 잘렸습니다.");
  }
  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Claude 응답을 JSON으로 해석하지 못했습니다.");
  }

  const seen = new Set<number>();
  for (const pick of parsed.picks) {
    if (pick.index < 0 || pick.index >= articles.length) {
      throw new Error(`Claude가 후보 범위 밖의 번호(${pick.index})를 골랐습니다.`);
    }
    if (seen.has(pick.index)) {
      throw new Error(`Claude가 같은 기사(${pick.index})를 두 번 골랐습니다.`);
    }
    seen.add(pick.index);
  }
  if (parsed.picks.length !== pickCount) {
    throw new Error(`Claude가 ${pickCount}건이 아닌 ${parsed.picks.length}건을 골랐습니다.`);
  }

  return parsed.picks.map((pick, i) => ({
    ...articles[pick.index],
    rank: i + 1,
    titleKo: pick.titleKo,
    summaryKo: pick.summaryKo,
    reasonKo: pick.reasonKo,
  }));
}

export type Article = {
  // 출처 이름 (예: "WIRED"). 예전에 저장된 news.json에는 없을 수 있다
  source?: string;
  titleEn: string;
  descriptionEn: string;
  link: string;
  publishedAt: string | null;
  categories: string[];
  // 예전에 저장된 news.json에는 없을 수 있다
  imageUrl?: string | null;
};

export type NewsItem = Article & {
  rank: number;
  titleKo?: string;
  summaryKo?: string;
  reasonKo?: string;
};

export type NewsData = {
  generatedAt: string;
  mode: "ai" | "fallback";
  model: string | null;
  // 가져오지 못한 출처 이름 (모두 성공하면 없음)
  failedSources?: string[];
  items: NewsItem[];
};

// 기사를 가져올 RSS 목록. 여기에 추가하면 후보에 함께 들어간다.
export type Source = {
  id: string;
  name: string;
  url: string;
  // next/image로 보여 줄 수 있는 썸네일 주소 앞부분 (next.config.ts의 remotePatterns와 맞춘다)
  imagePrefix: string;
};

export const SOURCES: Source[] = [
  {
    id: "wired",
    name: "WIRED",
    url: "https://www.wired.com/feed/rss",
    imagePrefix: "https://media.wired.com/photos/",
  },
  {
    id: "verge-ai",
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    imagePrefix: "https://platform.theverge.com/wp-content/uploads/",
  },
];

export const IMAGE_PREFIXES = SOURCES.map((s) => s.imagePrefix);

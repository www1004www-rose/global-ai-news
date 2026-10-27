import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

// 한글 글꼴은 subset이 커서 미리 불러오지 않는다
const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["600", "700", "900"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "와이어드 AI 추천 뉴스",
  description: "와이어드 기사 중 AI가 고른 5건을 한국어로 요약",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}

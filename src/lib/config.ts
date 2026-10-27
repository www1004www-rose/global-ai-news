export const MODEL = "claude-haiku-5-5";

// 후보로 넘길 최신 기사 수와 최종 선정 수
export const CANDIDATE_COUNT = 30;
export const PICK_COUNT = 5;

// 남겨 둘 날짜별 백업 개수
export const BACKUP_DAYS = 7;

export const TIME_ZONE = "Asia/Seoul";

// 할인 상품 기사 제외 규칙
export const DEAL_CATEGORY_WORDS = ["deals", "shopping", "coupons"];
export const DEAL_LINK_PATTERNS = [/\/deals?\//i, /\/coupons?\//i, /-deals?-/i, /-sale-/i];
export const DEAL_TITLE_PATTERNS = [
  /\bdeals?\b/i,
  /\d+\s*%\s*off\b/i,
  /\bon sale\b/i,
  /\bsale\b/i,
  /\bdiscount(s|ed)?\b/i,
  /\bcoupons?\b/i,
  /\bpromo codes?\b/i,
];

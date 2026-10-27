import { mkdir, readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { BACKUP_DAYS, TIME_ZONE } from "./config";
import type { NewsData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const NEWS_FILE = path.join(DATA_DIR, "news.json");
const BACKUP_DIR = path.join(DATA_DIR, "backup");
const BACKUP_NAME = /^news-\d{4}-\d{2}-\d{2}\.json$/;

// 한국 시간 기준 YYYY-MM-DD
function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

// 중간에 끊겨도 파일이 깨지지 않도록 임시 파일에 쓴 뒤 바꿔 넣는다
async function writeJsonAtomic(file: string, data: NewsData) {
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  await rename(tmp, file);
}

export async function readNews(): Promise<NewsData | null> {
  try {
    return JSON.parse(await readFile(NEWS_FILE, "utf8")) as NewsData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function saveNews(data: NewsData) {
  await mkdir(BACKUP_DIR, { recursive: true });
  await writeJsonAtomic(NEWS_FILE, data);
  await writeJsonAtomic(path.join(BACKUP_DIR, `news-${todayKst()}.json`), data);
  await pruneBackups();
}

// 백업이 있는 날짜 목록 (최신순)
export async function listBackupDates(): Promise<string[]> {
  let files: string[];
  try {
    files = await readdir(BACKUP_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return files
    .filter((f) => BACKUP_NAME.test(f))
    .map((f) => f.slice("news-".length, -".json".length))
    .sort()
    .reverse();
}

// date는 반드시 YYYY-MM-DD 형식이어야 한다 (경로 조작 방지)
export async function readBackup(date: string): Promise<NewsData | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  try {
    return JSON.parse(await readFile(path.join(BACKUP_DIR, `news-${date}.json`), "utf8")) as NewsData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function pruneBackups() {
  const files = (await readdir(BACKUP_DIR)).filter((f) => BACKUP_NAME.test(f)).sort().reverse();
  await Promise.all(files.slice(BACKUP_DAYS).map((f) => unlink(path.join(BACKUP_DIR, f))));
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const busy = loading || isPending;

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.error ?? `요청 실패 (HTTP ${res.status})`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(`서버에 연결하지 못했습니다: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(242,107,85,0.6)] transition hover:bg-coral-deep disabled:cursor-wait disabled:opacity-60 dark:text-[#1a1210]"
      >
        <span aria-hidden className={busy ? "animate-spin" : ""}>↻</span>
        {busy ? "가져오는 중…" : "새로 가져오기"}
      </button>
      {loading && (
        <p className="text-xs text-muted">RSS를 읽고 기사를 고르는 중입니다. 잠시 기다려 주세요.</p>
      )}
      {error && (
        <p role="alert" className="max-w-sm rounded-xl bg-peach px-3 py-2 text-sm text-coral-deep ring-1 ring-line">
          {error}
        </p>
      )}
    </div>
  );
}

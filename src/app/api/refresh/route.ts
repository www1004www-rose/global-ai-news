import { isReadOnly, refreshNews } from "@/lib/refresh";

export async function POST() {
  if (isReadOnly()) {
    return Response.json(
      { ok: false, error: "서버에서는 새로 가져오기를 쓸 수 없습니다. 기사는 매일 자동으로 갱신됩니다." },
      { status: 403 },
    );
  }
  try {
    const data = await refreshNews();
    return Response.json({ ok: true, mode: data.mode, generatedAt: data.generatedAt });
  } catch (error) {
    console.error("[refresh]", error);
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

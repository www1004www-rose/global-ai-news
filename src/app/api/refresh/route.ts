import { refreshNews } from "@/lib/refresh";

export async function POST() {
  try {
    const data = await refreshNews();
    return Response.json({ ok: true, mode: data.mode, generatedAt: data.generatedAt });
  } catch (error) {
    console.error("[refresh]", error);
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

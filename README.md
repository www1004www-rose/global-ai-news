# Global AI News

WIRED와 The Verge AI RSS에서 최신 기사를 모아, Claude(`claude-haiku-5-5`)가 대학생이 관심 가질 만한 AI 기사 5건을 골라 한국어 제목·요약·선정 이유를 보여 주는 Next.js 앱입니다. 자세한 요구 사항은 [PRD.md](PRD.md)에 있습니다.

## 내 PC에서 실행

```bash
npm install
npm run dev
```

http://127.0.0.1:3000 을 엽니다. `.env.local`에 `ANTHROPIC_API_KEY`를 넣으면 AI 선정 모드로, 없으면 영어 최신 5건으로 동작합니다(형식은 `.env.example`).

화면 없이 갱신만 한 번 실행하려면 다음을 실행합니다.

```bash
npm run refresh
```

## 매일 자동 갱신과 배포

- **GitHub Actions** (`.github/workflows/refresh.yml`): 매일 한국 시간 오전 7시에 기사를 새로 골라 `data/`에 커밋합니다. 저장소 **Settings → Secrets and variables → Actions**에 `ANTHROPIC_API_KEY`를 넣어 두어야 합니다.
- **Vercel**: GitHub 저장소를 연결하면 `main`에 커밋이 올라올 때마다 자동으로 배포합니다. 서버 화면은 읽기 전용이라 새로 가져오기 버튼이 없습니다.

Actions가 `data/`를 매일 커밋하므로, 내 PC에서 작업을 시작하기 전에 `git pull`로 최신 데이터를 받아 주세요.

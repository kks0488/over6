<p align="center">
  <img src="assets/banner.png" alt="Over6: five AI philosophers debate your question, a sixth AI argues against them all" width="100%">
</p>

<p align="center">
  <b>English</b> · <a href="README.ko.md"><b>한국어</b></a>
</p>

<h2 align="center">When everyone agrees, someone should argue back.<br>Over6 makes that someone an AI.</h2>

<p align="center">
  A multi-agent debate app: five AI philosophers from different traditions argue your question over three rounds,<br>
  then a sixth AI takes the consensus apart. The final call stays with you.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/kks0488/over6?color=818cf8" alt="License: MIT"></a>
  <a href="https://github.com/kks0488/over6/stargazers"><img src="https://img.shields.io/github/stars/kks0488/over6?style=flat&color=eab308" alt="Stars"></a>
  <img src="https://img.shields.io/github/languages/top/kks0488/over6?color=3178c6" alt="Top language">
  <a href="https://github.com/kks0488/over6/commits/main"><img src="https://img.shields.io/github/last-commit/kks0488/over6?color=3fb950" alt="Last commit"></a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs" alt="Next.js 16">
</p>

<table>
<tr>
<td width="50%" valign="top">

### Five philosophers, picked for disagreement
Your question is matched to 5 of 12 traditions (utilitarianism, Kantian ethics, existentialism, Confucianism, Daoism, Buddhism, care ethics and more), chosen so their views actually collide.

</td>
<td width="50%" valign="top">

### Three real rounds
Round 1: independent positions. Round 2: they rebut each other. Round 3: final positions. Every speaker is a separate prompt with its own tradition and stance.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### A sixth AI against the consensus
The "Wallbreaker" is not a participant. It rebuts weak evidence, reverses hypotheses, exposes bias, asks the root question, and looks at it through mortality.

</td>
<td width="50%" valign="top">

### A report, not a verdict
You get consensus, dissent, biases found, missing perspectives and questions to think about. An optional "Socrates engine" checks your question's framing before the debate starts.

</td>
</tr>
</table>

## Quick start

Requires Node.js 20+ and an API key for any OpenAI-compatible endpoint.

```bash
git clone https://github.com/kks0488/over6.git
cd over6
npm install
cp .env.example .env.local   # add OPENAI_API_KEY (and OPENAI_BASE_URL if you use a proxy)
npm run dev                  # http://localhost:9032
```

Saving debates and the community page need a Postgres database (`POSTGRES_URL`, e.g. Vercel Postgres or Neon).
Without it, debates still run; they just aren't stored.

## Demo

<p align="center"><img src="assets/screenshot-home.png" alt="Over6 home page" width="100%"></p>

<p align="center"><img src="assets/screenshot-debate.png" alt="Starting a debate, with the Socrates engine toggle" width="100%"></p>

The whole pipeline can also run from the terminal against a local dev server:

<p align="center"><img src="assets/demo.svg" alt="Terminal demo: run-debate.sh assigns five philosophers, runs three rounds, the sixth AI and the report" width="100%"></p>

The philosophers shown are the ones assigned in a real run; the full transcript is in
[`docs/debates/debate-ai-jobs.md`](docs/debates/debate-ai-jobs.md) (another one: [euthanasia](docs/debates/debate-euthanasia.md)).
The app's interface and debates are in Korean.

## How it works

```mermaid
flowchart LR
    Q([Your question]) --> S{Socrates engine<br/>optional}
    S --> A[Assign 5 of 12<br/>traditions]
    A --> R1[Round 1<br/>positions] --> R2[Round 2<br/>rebuttals] --> R3[Round 3<br/>final]
    R3 --> W[6th AI<br/>Wallbreaker]
    W --> P[Report]
    P --> C[(Community<br/>optional)]
```

| Step | API route | File |
| --- | --- | --- |
| Question framing, assumptions, bias check | `POST /api/socrates` | `lib/ai/socrates.ts` |
| Pick five traditions that disagree | `POST /api/debate/assign` | `lib/ai/assigner.ts`, `lib/philosophers/` |
| Debate rounds | `POST /api/debate/round` | `lib/ai/debate.ts` |
| Sixth AI rebuttal | `POST /api/debate/sixth` | `lib/ai/sixth-ai.ts` |
| Thinking report | `POST /api/debate/report` | `lib/ai/reporter.ts` |
| Save, share, delete | `/api/debates` | `lib/db/` |

The product design (in Korean) is in [`Over6_ServiceDesign.md`](Over6_ServiceDesign.md).

## FAQ

**Which models does it use?**
Anything behind an OpenAI-compatible Chat Completions API. Set `OPENAI_MODEL` (default `gpt-5.2`) and `OPENAI_BASE_URL`.

**Is it an answer engine?**
No. The report lays out positions, strengths, weaknesses and open questions. Deciding is left to you on purpose.

**Can I read past debates without running anything?**
Yes, two full transcripts are in [`docs/debates/`](docs/debates/).

## Roadmap (planned)

- English interface and English-language debates.
- Hosted demo.

## License

[MIT](LICENSE) © 2026 Kyoungsoo Kim

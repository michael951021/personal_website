---
name: add-writing
description: Add or update a post in the site's Writing section (content/writing/*.mdx), including interactive charts built from data. Use when asked to add a blog post, report or write-up to the website, to put text the user wrote on the site, or to add a chart or figure to a post.
---

# Adding to the Writing section

Posts live in `content/writing/<slug>.mdx` and render at `/writing/<slug>` (list at `/writing`, linked in the nav).
Read `AGENTS.md` first: this is Next.js 16, check `node_modules/next/dist/docs/` before using an unfamiliar API.

## 1. The post

```mdx
---
title: Post Title
date: "YYYY-MM-DD"
summary: One or two sentences for the list page and the page description.
tags: [Tag, Another]
---

Body in Markdown. `## Heading` for sections (h2 has the site's rule line under it).
```

- **When the user supplies the text, do not rewrite it.** Fix only real grammatical errors (agreement, tense, missing
  subject, hyphenated compound modifiers, acronym capitals), list every change in your reply, and flag — do not fix —
  factual claims that disagree with the data and placeholders the user left (e.g. `…`).
- Quoted examples go in `>` blockquotes; lists render with bullets.
- Static files a post links to (a sample page, an image) go in `public/writing/<slug>/` and are linked as
  `/writing/<slug>/<file>`.

## 2. Figures

A figure is a client component in `components/writing/`, registered in `components/writing/index.tsx`, used in
MDX by name: `<ContextChart />`.

- **MDX props must be plain strings.** next-mdx-remote v6 strips JavaScript expressions (`rows={[...]}` arrives as
  `undefined` and breaks the build). Pass data through imports, or as children with string attributes
  (see `PlanPath` / `PlanRow`).
- Data: a JSON file in `content/writing/data/`, imported by the component. Keep it small (aggregate first).
- Use `components/writing/chart-kit.tsx`: `Figure` (frame + caption + toggles), `Toggle`, `Legend`, `Tip`
  (tooltip), `useWidth` (responsive width), `ticks`, `k`, `SERIES` (colors), `axisText`.
- Colors: text and lines use the tokens (`var(--color-ink)`, `--color-muted`, `--color-border`, `--color-surface`,
  `--color-bg`), because the site's palette shifts from pale blue to deep navy as the reader scrolls. Series use
  `SERIES`, mid-tone colors that read on both.
- Every chart gets a caption saying what is plotted and how to read it; interactive ones say "hover" or show toggles.

## 3. Data from the agent loop

`scripts/export_loop_study.py [LOOP_DIR] [RUN_REPORT]` refreshes `content/writing/data/local-multi-agent-loop.json`
and `public/writing/local-multi-agent-loop/sample-run.html` from the loop's reports (`LOOP_DIR` defaults to
`../loop`; rebuild its `reports/study.json` first with `.venv/bin/python lib/study.py` there). Copy the pattern for
other data sources: a stdlib script in `scripts/` that writes the post's JSON, so figures can be regenerated.

## 4. Check before committing

```bash
npx tsc --noEmit
npx eslint components/writing app/writing lib/posts.ts          # plus any file you touched
npm run build                                                   # prerenders every post; MDX errors show here
npx next start -p 3123                                          # then open /writing and the post
```

Look at the page at desktop and phone width (e.g. `firefox --headless --screenshot` with `--window-size=390,6000`),
hover a chart, flip its toggles. Stop the server by port (`ss -ltnp 'sport = :3123'`), not `pkill -f` with a pattern
that appears in your own command line.

Commit on a branch or `main` as the user prefers; pushing publishes the site, so ask before pushing.

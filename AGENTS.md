<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
Here's:aPdetailedgbreakdownlofdtheoentirenstack:rol+v (not cmd+v!)

  ---
❯ Framework & Runtime
  
  Next.js 16 + React 19 — the core framework. The app uses the App Router (the
  app/ directory), which is Next.js's modern routing model. Every file named
  page.tsx inside a folder becomes a route:

  - app/page.tsx → /
  - app/work/page.tsx → /work
  - app/about/page.tsx → /about
  - app/work/[slug]/page.tsx → /work/rate-limiter, /work/search-pipeline, etc.
  (the [slug] bracket syntax is a dynamic segment)

  TypeScript is used throughout (tsconfig.json + @types/* packages).

  ---
  Layout & Shell (app/layout.tsx)

  This is the root layout — it wraps every page on the site. It does four things:

  1. Loads fonts via next/font/google — Newsreader (serif) and JetBrains Mono.
  Next.js downloads these at build time and serves them from your own domain, not
   Google's, which avoids the extra DNS lookup and is better for privacy. It
  injects them as CSS variables (--font-newsreader, --font-jetbrains) on the
  <html> element.
  2. Generates site-wide <head> metadata (title template, OpenGraph tags) from
  lib/config.ts.
  3. Mounts <Underwater /> as a fixed background layer (explained below).
  4. Wraps every page in a centered column (max 960px, responsive padding via
  clamp()) with Nav at the top and Footer at the bottom.

  ---
  Design Tokens & Styling (app/globals.css)
  
  Tailwind CSS v4 — this version uses a completely different config model from
  v3. Instead of a tailwind.config.js file, the theme is declared directly in CSS
   using @theme blocks. The @import "tailwindcss" at the top replaces the old
  @tailwind base/components/utilities directives.

  The @theme block defines five CSS custom properties (design tokens):

  --color-bg       cream/white → deep navy (light/dark extremes)
  --color-ink      near-black  → pale blue
  --color-muted    warm gray   → slate blue
  --color-border   light warm  → dark blue
  --color-surface  off-white   → very dark blue

  These tokens are what the Underwater component interpolates between as you
  scroll (see below). Every component uses them via var(--color-ink) etc., so the
   whole site's palette shifts in unison.

  @tailwindcss/typography provides the .prose class used in MDX articles. The CSS
   file overrides its default colors to use the same tokens.

  ---
  Site Config (lib/config.ts)
  
  A plain exported object with your name, email, bio, role, location, and an
  available flag. Every page imports from here — it's the single source of truth
  for your identity so you only edit one file.

  ---
  Content & Projects (lib/projects.ts, content/work/*.mdx)
  
  Projects are written as MDX files in content/work/. MDX is Markdown with a YAML
   frontmatter header:

  ---
  title: Distributed Rate Limiter
  year: "2024"
  type: Systems Engineering
  status: Deployed
  summary: ...
  tags: [Go, Redis, Distributed Systems]
  ---

  ## Background
  ...markdown body...

  lib/projects.ts reads that directory at build time using Node's fs module,
  parses the frontmatter with gray-matter, and returns typed Project objects
  sorted by year descending. This runs only on the server — it never ships to the
   browser.

  ---
  Work Detail Pages (app/work/[slug]/page.tsx)

  Three things happen here:

  1. generateStaticParams — runs at build time, calls getAllProjects() to get all
   slugs, and tells Next.js to pre-render a static HTML page for each one. No
  server needed at runtime.
  2. generateMetadata — produces <title> and <meta description> for each project
  page from its frontmatter.
  3. MDXRemote from next-mdx-remote/rsc — renders the markdown body into React.
  The /rsc import is the React Server Component version (no client-side JS
  needed). A components map overrides every standard HTML element (h1, h2, p,
  code, pre, etc.) with custom React versions that apply the design tokens via
  inline styles. This is why the article typography matches the rest of the site.

  ---
  The Underwater Effect (components/underwater.tsx)
  
  This is a client component ('use client') because it uses browser APIs and
  React hooks. It does two separate things that both respond to scroll depth:

  1. Color depth interpolation

  When you scroll, computeT() calculates scrollY / maxScrollHeight — a number
  from 0 (top) to 1 (bottom). On every scroll event it calls applyDepth(t),
  which:

  - Iterates over the PALETTE object, where each token has a start color (light,
  warm) and end color (dark, cool/blue)
  - Uses lerp() (linear interpolation: a + (b - a) * t) to compute the in-between
   RGB values
  - Writes them directly onto document.documentElement via style.setProperty

  So --color-bg at the top is rgb(246,244,240) (cream). At the bottom it's
  rgb(7,16,36) (deep navy). Every element using var(--color-bg) updates
  instantly. The scroll listener uses requestAnimationFrame for smooth rendering
  and skips updates if the scroll delta is tiny (< 0.3%).

  2. Fish

  spawnFish() creates a DOM element, injects an inline SVG fish silhouette
  (hardcoded as a string — oval body + forked tail polygon + dorsal arc + eye
  circle), and animates it across the screen using requestAnimationFrame:

  - Direction: 70% chance rightward, 30% leftward
  - Vertical position: random, 60px from either edge of the viewport
  - Speed: 0.9–2.7px per frame (~54–162px/sec at 60fps)
  - Scale: 0.65–1.35×
  - Opacity: 0.07–0.35, increases slightly with scroll depth (deeper = more
  visible fish)
  - Movement: Math.sin(tick * 0.04) * 5 adds a gentle vertical sine wave

  Fish spawn on a random interval: first one after 3–8 seconds, then every 9–24
  seconds. The container div is position: fixed; inset: 0; z-index: 0 — it sits
  behind all page content. The content column in layout.tsx has z-index: 1 and
  background: transparent, so the fish show through in the margins.

  The useEffect cleanup removes the scroll listener, cancels the animation frame,
   clears the spawn timer, and resets all CSS variables (so if the component
  unmounts, colors go back to their CSS defaults).

  ---
  Navigation (components/nav.tsx)

  Client component because it calls usePathname() (a React hook) to detect the
  active route. The active link gets full opacity; inactive links are 70%
  opacity.

  ---
  Pages Summary

  ┌──────────────┬──────────────────────────┬─────────────────────────────────┐
  │    Route     │           File           │              Type               │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /            │ app/page.tsx             │ Server component, lists         │
  │              │                          │ projects                        │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /work        │ app/work/page.tsx        │ Server component, full project  │
  │              │                          │ list                            │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /work/[slug] │ app/work/[slug]/page.tsx │ Statically generated            │
  │              │                          │ per-MDX-file                    │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /about       │ app/about/page.tsx       │ Server component, bio/contact   │
  └──────────────┴──────────────────────────┴─────────────────────────────────┘

  ---
  Build & Tooling
  
  - postcss.config.mjs — wires up @tailwindcss/postcss so Tailwind processes your
   CSS at build time
  - eslint.config.mjs — uses eslint-config-next for Next.js-aware linting rules
  - next build pre-renders all pages to static HTML (SSG) — the fish and color
   CSS at build time
  - eslint.config.mjs — uses eslint-config-next for Next.js-aware linting rules
  - next build pre-renders all pages to static HTML (SSG) — the fish and color
  effect are the only runtime JS

✻ Churned for 1m 2s

✻ Churned for 1m 2s

※ recap: You asked for a full explanation of the portfolio site stack. I read

  - postcss.config.mjs — wires up @tailwindcss/postcss so Tailwind processes your CSS at build time
  - eslint.config.mjs — uses eslint-config-next for Next.js-aware linting rules
  - next build pre-renders all pages to static HTML (SSG) — the fish and color effect are the only runtime JS
  active route. The active link gets full opacity; inactive links are 70%
  opacity.

  ---
  Pages Summary

  ┌──────────────┬──────────────────────────┬─────────────────────────────────┐
  │    Route     │           File           │              Type               │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /            │ app/page.tsx             │ Server component, lists         │
  │              │                          │ projects                        │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /work        │ app/work/page.tsx        │ Server component, full project  │
  │              │                          │ list                            │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /work/[slug] │ app/work/[slug]/page.tsx │ Statically generated            │
  │              │                          │ per-MDX-file                    │
  ├──────────────┼──────────────────────────┼─────────────────────────────────┤
  │ /about       │ app/about/page.tsx       │ Server component, bio/contact   │
  └──────────────┴──────────────────────────┴─────────────────────────────────┘

  ---
  Build & Tooling

  - postcss.config.mjs — wires up @tailwindcss/postcss so Tailwind processes your
   CSS at build time
  - eslint.config.mjs — uses eslint-config-next for Next.js-aware linting rules
  - next build pre-renders all pages to static HTML (SSG) — the fish and color
  effect are the only runtime JS
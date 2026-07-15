# AGENTS.md — richardkern-nz

Instructions for any AI coding agent working in this repo. Tool-specific overrides live in `CLAUDE.md` (Claude Code) — thin files only, this is the source of truth.

## What this is

richardkern.nz — Richard's personal site: a blog covering both technical material (homelab, AI agents, web dev) and personal reflection (running, aviation, building things for their own sake — deliberate scope, not drift), plus a portfolio of what he's built. Planning docs live in the Obsidian vault at `/Users/richardkern/vaults/richard-kb/30 - Projects/Personal Site/` — the PRD, Design Spec, and Build Plan there are the source of truth for *why*; this file summarises *what*.

## Stack (finalised — do not re-litigate)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| CMS | Payload CMS 3.x |
| Database | PostgreSQL 17 (local dev: port 5432, db `richardkern-nz`, password `localpassword`) |
| Styling | Tailwind 4 (no shadcn/ui — removed in de-templating; only the `cn` clsx+tailwind-merge helper remains) |
| Package manager | pnpm 11 — install with `pnpm ii` (now just plain `pnpm install`; the old `--ignore-workspace` form skipped `pnpm-workspace.yaml`'s `allowBuilds` and `overrides` and silently stripped the security floors from the lockfile — fixed 2026-07-07, same lesson as Westgate) |
| Runtime | Node.js 24+ |
| Media | Local disk in dev; Cloudflare R2 in production |
| Hosting | VPS via Coolify: push `main` → production, `develop` → staging |
| Analytics | Umami (self-hosted on the Beelink, `analytics.richardkern.nz`) — live |

Rejected alternatives and reasoning: `Personal Site Stack Decisions` in the vault.

## Workflow

- Branching matches Westgate's pattern: build on `develop`, PR to `main`. Coolify is wired: `develop` → staging, `main` → production. A merge to `main` doesn't always auto-redeploy prod — verify the deployed commit and hit Redeploy in Coolify if it lags. `NEXT_PUBLIC_*` vars inline at build, so set them (and mark build-time) before the prod build, not after.
- **The site is live** (launched 2026-07-12). The build phases (00 groundwork → 05 go-live) are done; work is now in Phase 06 (Care): analytics, SEO/structured data, post-launch fixes, dependency upkeep. Session work still ticks the relevant phase note in `30 - Projects/Personal Site/Phases/`, and new scope goes to the Build Plan's Later list rather than expanding the task in hand.
- Session protocol: at the start of a work session, read the two or three most recent logs in the vault's `90 - Meta/Sessions/`; at the end, write one using the Session Log template there. Full protocol in the vault's `CLAUDE.md`.

## Payload Collections

- **Posts** — blog posts with Lexical rich text (code blocks + inline code enabled), tags, coverImage, SEO fields, draft/publish
- **Projects** — portfolio items with tabbed UI (Content / Media / Links), tech array, featured flag, year, tags, coverImage, gallery images, Lexical longDescription, draft/publish
- **Tags** — flat taxonomy (name + slug), shared across Posts and Projects
- **Pages** — CMS-managed pages routed via `/[slug]` (e.g. /about)
- **Media** — file uploads; local disk in dev, R2 in production
- **Users** — auth-enabled, admin access only; no public accounts

## Payload Globals

- **Header** — inner-page navigation
- **Footer** — inner-page footer
- **SiteSettings** — siteTitle, bio, byline (post-footer author line), socialLinks (array: platform + url), navConfig

## Site Routes

```
/                    homepage: paper page with charcoal "spine" rail (no Header/Footer)
/posts               post index, paginated; ?tag= filters (decided: /posts, not /blog)
/posts/[slug]        individual post
/work                projects index (featured first, then year desc)
/work/[slug]         individual project
/[slug]              CMS-managed pages (e.g. /about)
/feed.xml            RSS
/admin               Payload admin panel
```

De-templating is **done** (2026-07-06): `/search` + search plugin, form-builder plugin, `next/seed`, nested-docs dependency, BeforeLogin/BeforeDashboard, the template theme system (no dark mode — one paper surface), template heros, and shadcn ui leftovers are all removed. No search, forms, or comments at launch — they're on the Later list, not forgotten.

## Design direction — "Cover & Pages" with a logbook layer (fixed, revised 2026-07-06)

Full intent in the vault `Design Spec` (revised 2026-07-06) and `Design Decisions - 2026-07-06`; the Fixed / Implementer's-choice boundary governs. The short version:

- One paper surface throughout in the default (light) theme. Charcoal appears only where the site is structural or technical: the homepage spine rail, code blocks, and the footer. That's the signature move — don't add competing devices.
- **Dark mode (added 2026-07-09):** a real inverted theme, not a workaround. In dark the whole page becomes the cover material (charcoal), so the structural panels can't stay charcoal-on-charcoal — they sit on `--color-structural`, a hair-lifted charcoal (`#20261E`), to read as distinct. Follow the OS by default (`prefers-color-scheme`), overridable by a header/spine toggle (light / dark / system) that persists in `localStorage`; an inline `<head>` script (`src/providers/Theme`) applies the choice before paint, and `color-scheme` is declared so mobile browsers stop force-darkening the page. **Style with the semantic, theme-aware tokens — `bg-surface`, `text-body`, `text-muted`, `text-accent`, `bg-structural`, and the `hairline`/`rule` borders (which flip in place) — never the raw `paper`/`ink`/`fern`/`haze`/`charcoal` classes on page surfaces.** The raw anchors stay literal only where a surface is fixed regardless of theme: the light text (`text-paper*`) and moss accent on the always-dark structural panels. See `globals.css` `@theme` + the theme-resolution scopes below it. This reversed the Design Spec's original "no dark mode" line (Richard's call, 2026-07-09); the spec's Theme section now records the change.
- The logbook layer: everything *about* an entry (N°, dates, tech, filenames) is small Geist Mono; everything *in* an entry is serif. Entry N° is real — chronological published-post position (`src/utilities/logbook.ts`).
- Palette: Bush Charcoal `#171B16`, Paper `#F7F5EF`, Ink `#22261F`, Fern `#2A5A43` (accent on paper), Moss `#8FB8A5` (accent on charcoal — fern fails AA there), Haze `#5E6459` (muted on paper). Tokens live in `globals.css` `@theme`.
- Type: Schibsted Grotesk (display — Bricolage was dropped 2026-07-06), Source Serif 4 (long-form body), Geist Sans (UI), Geist Mono (code + the logbook layer). Loaded via `next/font`.
- Wordmark, no monogram: `richardkern.nz` in Geist Mono 500 lowercase, `.nz` fern on paper / moss on charcoal (16px header, 12.5px footer, 13px vertical on the spine).
- Homepage: paper with a persistent 86px charcoal spine (vertical wordmark, circled mono social glyphs); charcoal top bar on mobile. No Header/Footer on `/` — inner pages use the `(inner)` route group's chrome.
- Tone: consistently beautiful, slightly understated. The web-design-standards skill's hard bans and end-of-build checklist apply to all frontend work.
- **Design context lives at the repo root:** `PRODUCT.md` (strategic — brand register, users, positioning, anti-references, principles) and `DESIGN.md` (the "Cover & Pages" visual system as machine-readable tokens + prose), generated by `/impeccable init` + `document` (2026-07-15). These are the design source of truth *for the code*; the vault `Design Spec` remains the source of truth for *why*. `.impeccable/` carries the live-mode config and the `design.json` sidecar the impeccable panel renders from. When the two disagree on a visual rule, `DESIGN.md` wins for implementation; keep it and the vault spec in sync. Impeccable is opt-in (`/impeccable audit | critique | polish | ...`); web-design-standards is the always-on floor (its §0.5 sets the precedence).

## Conventions

- Fetch data at the page/route level with the Payload Local API and pass down as typed props; avoid RSC-specific patterns deep in the tree (vault: framework migration posture)
- Route handlers (`app/api/...`) for mutations, not Server Actions, for anything security-relevant
- Never rely on middleware as the sole auth enforcement layer
- Access control: public read of published docs only; authenticated create/update; drafts must never leak through frontend queries
- Media uploads go through the Media collection (R2 in production) — never to the repo or public/. R2 storage (`s3Storage` in `src/plugins`) switches on when all four `R2_*` env vars are present and stays on local disk otherwise; it deliberately sets no `prefix` option, because that would add a media column and the schema must stay identical whether the plugin is enabled or not
- After schema changes: `pnpm generate:types` (never edit `payload-types.ts`), then `pnpm migrate:create <name>` to generate a migration into `src/migrations`
- After adding/removing a Payload plugin or any admin component: `pnpm generate:importmap` and commit the regenerated `importMap.js`. Dev regenerates the map on startup so a stale map is invisible locally, but production builds use the committed file and the entire admin renders as a blank page with no client-side error (the only trace is a `getFromImportMap` warning in the server log) — this blanked staging on 2026-07-07 after the R2 plugin was added (this script routes through tsx — the plain `payload migrate:create` bin crashes in this repo; `pnpm migrate` and `pnpm migrate:status` work fine as-is)
- Local dev schema-pushes (Payload default); staging/production/CI run real migrations. The deploy build (Dockerfile builder stage) runs `pnpm migrate && pnpm build` — the build needs a live database regardless because pages statically generate via the Local API. Never run `pnpm migrate` against the schema-pushed local dev database; it will fail on existing tables (CI and fresh databases are fine)
- Seeds run via `./node_modules/.bin/tsx scripts/seed-dev.ts` (`payload run` exits silently in this repo; the script loads dotenv itself). Pass `context: { disableRevalidate: true }` on every Local API write outside Next, or the revalidate hooks throw.

## Environment variables (names + sources, no values)

| Variable | Source |
|---|---|
| `DATABASE_URL` | docker-compose locally; Coolify-managed Postgres per environment |
| `PAYLOAD_SECRET` | generated per environment |
| `CRON_SECRET` | generated per environment (Payload jobs endpoint) |
| `PREVIEW_SECRET` | generated per environment (draft-preview route). Read server-side by `generatePreviewPath` and `/next/preview`; if unset in Coolify the admin post preview 403s with "You are not allowed to preview this page" (bit staging + production 2026-07-11, was missing from this table so never added to Coolify) |
| `NEXT_PUBLIC_SERVER_URL` | per environment (localhost:3000 / staging domain / richardkern.nz) |
| `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Cloudflare R2 dashboard (production/staging only; dev uses local disk) |
| `RESEND_API_KEY` | Resend dashboard (staging/production; when unset, Payload logs emails to the console — dev default) |
| `NEXT_PUBLIC_UMAMI_SRC`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami dashboard (self-hosted on the Beelink, `analytics.richardkern.nz`). **Production only**, and **build-time** (NEXT_PUBLIC_* inline at build); both must be set or the tracking script renders nothing (dev/staging default). Outbound social-link clicks are tagged `data-umami-event="social-link"` |

## Common commands

- `pnpm dev` — run the app (`docker compose up -d` first for the database)
- `pnpm build` — production build (postbuild generates the sitemap)
- `pnpm lint` / `pnpm lint:fix`
- `pnpm test` — integration (vitest) then e2e (playwright); `pnpm test:int` / `pnpm test:e2e` individually
- `docker compose down -v && docker compose up -d` — wipe and recreate the database

## Known issues / watch out for

- VS Code's built-in CSS validator throws false errors on Tailwind v4 directives (`@theme`, `@source`, `@plugin`, `@variant`). This is suppressed via `.vscode/settings.json` (`css.validate: false`, `scss.validate: false`). The CSS is correct — do not remove these directives.
- Tailwind IntelliSense may suggest canonical class rewrites (e.g. `min-h-[100vh]` → `min-h-screen`). These are style suggestions, not errors. Fix opportunistically, not urgently. Prettier's Tailwind plugin also rewrites arbitrary values to canonical utilities on save (`max-w-[880px]` → `max-w-220`) — don't fight it, they're equivalent.
- When making schema changes in dev, Payload runs an interactive migration prompt on next `pnpm dev`. If it errors on a constraint that doesn't exist, wipe the database with `docker compose down -v && docker compose up -d`, then reseed dev content with `./node_modules/.bin/tsx scripts/seed-dev.ts` (creates admin user richard.kern@gmail.com / localpassword — dev only).

## Source of truth (vault: `30 - Projects/Personal Site/`)

- `PRD` — goals, users, requirements, success criteria
- `Design Spec` — IA, content model, page-by-page intent, visual direction, Fixed vs implementer's-choice
- `Build Plan` + `Phases/` — phase order, tasks, estimates
- `Personal Site Stack Decisions` — why each tool, what was rejected

In-repo (design, generated by impeccable — see the Design direction section): root `PRODUCT.md` (strategic) and `DESIGN.md` (visual tokens); `.impeccable/design.json` (panel sidecar) and `.impeccable/live/config.json` (live-mode).

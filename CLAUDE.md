# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## What this is

richardkern.nz — Richard's personal site: a blog covering both technical material (homelab, AI agents, web dev) and personal reflection (running, aviation, building things for their own sake — deliberate scope, not drift), plus a portfolio of what he's built. Planning docs live in the Obsidian vault at `~/vaults/richard-kb/30 - Projects/Personal Site/` — the PRD, Design Spec, and Build Plan there are the source of truth for *why*; this file summarises *what*.

## Stack (finalised — do not re-litigate)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| CMS | Payload CMS 3.x |
| Database | PostgreSQL 17 (local dev: port 5432, db `richardkern-nz`, password `localpassword`) |
| Styling | Tailwind 4 + shadcn/ui |
| Package manager | pnpm 11 (`pnpm ii` to install, never plain `pnpm install`) |
| Runtime | Node.js 24+ |
| Media | Local disk in dev; Cloudflare R2 in production |
| Hosting | VPS via Coolify: push `main` → production, `develop` → staging |
| Analytics | Umami (self-hosted), post-launch |

Rejected alternatives and reasoning: `Personal Site Stack Decisions` in the vault.

## Build phases

Work proceeds one phase at a time per the vault's `Build Plan` (Phase 00 groundwork → 01 deploy pipeline → 02 schema/de-templating → 03 frontend → 04 editor workflow → 05 content/go-live → 06 care). Each session updates its phase note's checkboxes in `30 - Projects/Personal Site/Phases/`. Don't pull work forward from a later phase; scope creep goes to the Build Plan's Later list.

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
- **SiteSettings** — siteTitle, bio, socialLinks (array: platform + url), navConfig

## Site Routes

```
/                    homepage: paper page with charcoal "spine" rail (no Header/Footer)
/posts               post index, paginated; ?tag= filters (decided: /posts, not /blog)
/posts/[slug]        individual post
/work                projects index (featured first, then year desc)
/work/[slug]         individual project
/[slug]              CMS-managed pages (e.g. /about)
/feed.xml            RSS (Phase 03)
/admin               Payload admin panel
```

To be **removed** in Phase 02: `/search` + search plugin, form-builder plugin, `next/seed`, `@payloadcms/plugin-nested-docs` dependency, template BeforeLogin/BeforeDashboard components. No search, forms, or comments at launch — they're on the Later list, not forgotten.

## Design direction — "Cover & Pages" (fixed)

Full intent in the vault `Design Spec`; its Fixed / Implementer's-choice boundary governs. The short version:

- One paper surface throughout. Charcoal appears only where the site is structural or technical: the homepage spine rail, code blocks, and the footer. That's the signature move — don't add competing devices.
- Palette: Charcoal `#14181D`, Paper `#F7F6F2`, Ink `#1F242B`, Fern `#2A5A43` (accent), Haze `#6E7681` (muted, large sizes only — adjust per surface to pass AA).
- Type: Bricolage Grotesque (display), Source Serif 4 (long-form body), Geist Sans (UI), Geist Mono (code). Load via `next/font`.
- Homepage: paper with a persistent ~85px charcoal spine (monogram, vertical wordmark, social links); slim charcoal top bar on mobile. No Header/Footer on `/`.
- Tone: consistently beautiful, slightly understated. The web-design-standards skill's hard bans and end-of-build checklist apply to all frontend work.

## Conventions

- Fetch data at the page/route level with the Payload Local API and pass down as typed props; avoid RSC-specific patterns deep in the tree (vault: framework migration posture)
- Route handlers (`app/api/...`) for mutations, not Server Actions, for anything security-relevant
- Never rely on middleware as the sole auth enforcement layer
- Access control: public read of published docs only; authenticated create/update; drafts must never leak through frontend queries
- Media uploads go through the Media collection (R2 in production) — never to the repo or public/
- After schema changes: `pnpm generate:types` (never edit `payload-types.ts`)
- Production and CI use real Payload migrations; local dev may schema-push (Phase 01 sets this up)

## Environment variables (names + sources, no values)

| Variable | Source |
|---|---|
| `DATABASE_URL` | docker-compose locally; Coolify-managed Postgres per environment |
| `PAYLOAD_SECRET` | generated per environment |
| `CRON_SECRET` | generated per environment (Payload jobs endpoint) |
| `NEXT_PUBLIC_SERVER_URL` | per environment (localhost:3000 / staging domain / richardkern.nz) |
| `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Cloudflare R2 dashboard (production/staging only; dev uses local disk) |

## Common commands

- `pnpm dev` — run the app (`docker compose up -d` first for the database)
- `pnpm build` — production build (postbuild generates the sitemap)
- `pnpm lint` / `pnpm lint:fix`
- `pnpm test` — integration (vitest) then e2e (playwright); `pnpm test:int` / `pnpm test:e2e` individually
- `docker compose down -v && docker compose up -d` — wipe and recreate the database

## Known issues / watch out for

- VS Code's built-in CSS validator throws false errors on Tailwind v4 directives (`@theme`, `@source`, `@plugin`, `@variant`). This is suppressed via `.vscode/settings.json` (`css.validate: false`, `scss.validate: false`). The CSS is correct — do not remove these directives.
- Tailwind IntelliSense may suggest canonical class rewrites (e.g. `min-h-[100vh]` → `min-h-screen`). These are style suggestions, not errors. Fix opportunistically, not urgently.
- When making schema changes in dev, Payload runs an interactive migration prompt on next `pnpm dev`. If it errors on a constraint that doesn't exist, wipe the database with `docker compose down -v && docker compose up -d`.
- The seoPlugin's `generateTitle` still says "Payload Website Template" and `generateURL` doesn't know the `/posts/` and `/work/` prefixes — fixed in Phase 02; don't ship metadata before that lands.

## Source of truth (vault: `30 - Projects/Personal Site/`)

- `PRD` — goals, users, requirements, success criteria
- `Design Spec` — IA, content model, page-by-page intent, visual direction, Fixed vs implementer's-choice
- `Build Plan` + `Phases/` — phase order, tasks, estimates
- `Personal Site Stack Decisions` — why each tool, what was rejected

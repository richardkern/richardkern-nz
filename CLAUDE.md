# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## Project Stack

- **Framework**: Next.js 16 App Router
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL (local dev: port 5432, db `richardkern-nz`, password `localpassword`)
- **Styling**: Tailwind 4 + shadcn/ui
- **Package manager**: pnpm 11
- **Runtime**: Node.js 24+
- **Media storage**: Local file storage in dev; Cloudflare R2 to be added before first deployment

## Local Dev

Start the database: `docker compose up -d`

Run the app: `pnpm dev`

If the database needs a clean reset: `docker compose down -v && docker compose up -d`

## Payload Collections

- **Posts** — blog posts with Lexical rich text (code blocks + inline code enabled), tags, coverImage, SEO fields, draft/publish
- **Projects** — portfolio items with tabbed UI (Content / Media / Links), tech array, featured flag, year, tags, coverImage, gallery images, Lexical longDescription, status
- **Tags** — flat taxonomy (name + slug), shared across Posts and Projects
- **Pages** — CMS-managed pages routed via `/[slug]`
- **Media** — file uploads; local disk in dev, R2 in production
- **Users** — auth-enabled, admin access only

## Payload Globals

- **Header** — site navigation (used on all inner pages)
- **Footer** — site footer (used on all inner pages)
- **SiteSettings** — siteTitle, bio, socialLinks (array: platform + url), navConfig

## Site Routes

```
/                    custom homepage (sidebar layout, dark)
/blog                post index
/blog/[slug]         individual post
/work                projects index
/work/[slug]         individual project
/[slug]              CMS-managed pages (e.g. /about)
/admin               Payload admin panel
```

## Layout conventions

- **Homepage** uses a full-viewport dark sidebar layout — no Header or Footer rendered
- **All other routes** use the standard Header + Footer from the template layout
- Geist Sans and Geist Mono are loaded globally

## Key decisions

- `Categories` collection was removed and replaced with `Tags` (flat taxonomy, no nested docs)
- Homepage queries Payload directly for SiteSettings, 3 recent published posts, and up to 3 featured published projects
- Lexical editor has code block and inline code features enabled on Posts and Projects
- `nestedDocsPlugin` removed (not needed for flat Tags)

## Known issues / watch out for

- VS Code's built-in CSS validator throws false errors on Tailwind v4 directives (`@theme`, `@source`, `@plugin`, `@variant`). This is suppressed via `.vscode/settings.json` (`css.validate: false`, `scss.validate: false`). The CSS is correct — do not remove these directives.
- Tailwind IntelliSense may suggest canonical class rewrites (e.g. `min-h-[100vh]` → `min-h-screen`). These are style suggestions, not errors. Fix opportunistically, not urgently.
- When making schema changes in dev, Payload runs an interactive migration prompt on next `pnpm dev`. If it errors on a constraint that doesn't exist, wipe the database with `docker compose down -v && docker compose up -d`.

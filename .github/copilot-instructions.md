# Copilot Instructions

Payload CMS 3.x + Next.js 16 App Router website (personal site/blog/portfolio), based on the
official Payload Website Template but with `Categories` replaced by a flat `Tags` taxonomy.

**Start here for Payload-specific patterns**: `.claude/skills/payload/SKILL.md`, then
`.claude/skills/payload/reference/` for detailed docs (COLLECTIONS.md, FIELDS.md, HOOKS.md,
ACCESS-CONTROL.md, QUERIES.md, ADAPTERS.md, ADVANCED.md, PLUGIN-DEVELOPMENT.md).

`README.md` is a maintained project overview. For anything it doesn't cover, prefer this file
and the code itself.

## Stack

- Next.js 16 App Router, Payload CMS 3.x, PostgreSQL (`@payloadcms/db-postgres`)
- Tailwind 4 (no shadcn/ui — only the `cn` clsx+tailwind-merge helper remains), Geist Sans/Mono fonts loaded globally
- pnpm 11, Node.js 24+

## Local dev

```bash
docker compose up -d          # start Postgres (port 5432, db `richardkern-nz`, password `localpassword`)
pnpm dev                      # run the app
docker compose down -v && docker compose up -d   # reset the database completely
```

Schema changes trigger an interactive migration prompt on next `pnpm dev` (dev uses schema push,
not a migrations workflow). If it errors on a nonexistent constraint, wipe the DB as above.

## Build, lint, test

```bash
pnpm lint                     # eslint .
pnpm lint:fix
pnpm exec tsc --noEmit        # typecheck (run by CI)
pnpm build                    # next build (+ postbuild runs next-sitemap)

pnpm test:int                 # vitest run --config ./vitest.config.mts (tests/int/**/*.int.spec.ts)
pnpm test:e2e                 # playwright test --config=playwright.config.ts (tests/e2e/**)
pnpm test                     # test:int then test:e2e
```

Run a single integration test file: `pnpm exec vitest run --config ./vitest.config.mts tests/int/api.int.spec.ts`
Run a single e2e test: `pnpm exec playwright test tests/e2e/frontend.e2e.spec.ts`

CI (`.github/workflows/ci.yml`) only runs lint + typecheck — there is deliberately no build/test
job yet because Payload+Postgres needs a live DB and a migrations story that doesn't exist; dev
currently uses schema push. Add a build/test job once migrations are in place.

`pnpm generate:types` regenerates `src/payload-types.ts` after collection/field/global schema
changes — it and `src/payload-generated-schema.ts` are eslint-ignored and should not be hand-edited.

## Architecture

- `src/payload.config.ts` is the root Payload config: registers collections/globals, DB adapter,
  plugins, and the jobs queue access rule (scheduled publish).
- `src/plugins/index.ts` wires up SEO, redirects, form-builder, and search plugins — this is where
  cross-cutting plugin behavior (e.g. `generateTitle`/`generateURL` for SEO, `revalidateRedirects`)
  lives, not in individual collection files.
- `src/collections/*` — each collection has its own directory with a `config.ts` plus a `hooks/`
  subfolder for its `beforeChange`/`afterChange`/`afterRead` hooks (e.g.
  `src/collections/Posts/hooks/populateAuthors.ts`, `revalidatePost.ts`).
- `src/access/*` — shared, composable access-control predicates (`anyone`, `authenticated`,
  `authenticatedOrPublished`) imported by collection configs rather than each collection defining
  its own logic inline.
- `src/blocks/*` — Layout Builder blocks (Hero, Content, Media, CallToAction, Archive, Form, Code,
  RelatedPosts, Banner) used by the Pages/Posts layout field and rendered on the frontend.
- `src/app/(frontend)` vs `src/app/(payload)` — Next.js route groups separating the public website
  from the Payload admin panel/API routes.
- On-demand revalidation: collections/globals use `afterChange`/`afterDelete` hooks
  (`revalidatePath`/`revalidateTag`) to invalidate the statically generated frontend when published
  content changes; unpublishing a previously-published doc also triggers revalidation of the old path.
- Draft preview and live preview are both enabled for Posts/Pages/Projects via Payload `versions.drafts`.

## Collections & Globals

- **Posts** — Lexical rich text (code blocks + inline code enabled), tags, coverImage, SEO fields, draft/publish
- **Projects** — tabbed admin UI (Content/Media/Links), tech array, featured flag, year, tags, coverImage, gallery, Lexical longDescription, status
- **Tags** — flat taxonomy (name + slug) shared by Posts and Projects (no nesting; `nestedDocsPlugin` was removed)
- **Pages** — CMS-managed, routed via `/[slug]`
- **Media** — uploads; local disk in dev, Cloudflare R2 planned for production
- **Users** — auth-enabled, admin access only
- **Globals**: `Header`, `Footer` (nav/footer content, used on all non-homepage routes), `SiteSettings` (siteTitle, bio, socialLinks, navConfig)

## Routes

```
/                    custom homepage — full-viewport dark sidebar layout, NO Header/Footer
/posts, /posts/[slug]
/work, /work/[slug]
/[slug]              CMS-managed Pages
/admin               Payload admin panel
```

All routes except the homepage use the standard Header + Footer from the template layout.

## Conventions

- Access control: compose from `src/access/` (`anyone`, `authenticated`,
  `authenticatedOrPublished`) rather than writing new inline predicates per collection.
- The `Users` collection is not publicly readable; anywhere author data is exposed publicly
  (e.g. Posts), populate a separate `populatedAuthors`-style field via an `afterRead` hook instead
  of exposing the `users` relationship directly.
- ESLint: `react-hooks/set-state-in-effect` and `react-hooks/refs` are warnings (not errors),
  scoped to `src/**`, because template code trips React Compiler-era rules — fix opportunistically.
- VS Code's built-in CSS validator false-flags Tailwind v4 directives (`@theme`, `@source`,
  `@plugin`, `@variant`); this is intentionally suppressed in `.vscode/settings.json`. Don't remove
  these directives.

# richardkern.nz

My personal site: a blog on homelab infrastructure, AI agents, and web development, alongside personal writing (running, aviation, building things for their own sake), plus a portfolio of what I've built.

Live at [richardkern.nz](https://richardkern.nz).

## Stack

- **Next.js 16** (App Router) + **Payload CMS 3** on **PostgreSQL 17**
- **Tailwind 4** with a custom "Cover & Pages" design and a real light/dark theme
- **pnpm 11**, **Node 24+**
- Media on **Cloudflare R2** (local disk in dev), email via **Resend**
- Deployed to a VPS via **Coolify**: `develop` → staging, `main` → production

## Content model

Payload collections: **Posts** (blog, Lexical rich text), **Projects** (portfolio), **Tags** (shared taxonomy), **Pages** (CMS-routed), Media, Users.

```
/            homepage (paper page with a charcoal "spine" rail)
/posts       blog index, ?tag= filters
/work        portfolio (featured first)
/[slug]      CMS-managed pages (e.g. /about)
/feed.xml    RSS
/admin       Payload admin
```

## Local development

```bash
docker compose up -d      # start Postgres (host port 5432)
pnpm install
cp .env.example .env       # fill in values
pnpm dev                   # http://localhost:3000  (admin at /admin)
```

| Command | |
|---|---|
| `pnpm dev` | run the app |
| `pnpm build` | production build (also generates the sitemap) |
| `pnpm lint` / `pnpm test` | lint / vitest + playwright |
| `pnpm generate:types` | regenerate `payload-types.ts` after a schema change |
| `pnpm migrate:create <name>` | generate a database migration |

## Documentation

- **[`AGENTS.md`](AGENTS.md)** — the developer guide: stack, content model, design direction, conventions, and gotchas. **Start here.**
- Planning docs (PRD, design spec, build plan) live in a private Obsidian vault.

## Status

This is a personal project: my own site, open-sourced so the code is available to read and borrow from. It is not accepting issues or pull requests. You are welcome to fork it or lift anything useful.

## License

Code is [MIT](LICENSE)-licensed. Blog content and images are © Richard Kern.

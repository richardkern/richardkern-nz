# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## Project Stack

- **Framework**: Next.js 16 App Router
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL (local dev: port 5432, db `richardkern-nz`, password `localpassword`)
- **Styling**: Tailwind 4 + shadcn/ui
- **Package manager**: pnpm
- **Media storage**: Local file storage (Cloudflare R2 to be added before first deployment)
- **Runtime**: Node.js 24+

## Local Dev

Start the database: `docker compose up -d`

Run the app: `pnpm dev`

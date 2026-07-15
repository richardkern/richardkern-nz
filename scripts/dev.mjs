// Single source of truth for the local dev-server port.
//
// Reads PORT (loaded from .env by `node --env-file-if-exists` in the `dev`
// script) and defaults to 3000 — richardkern.nz's reserved dev port, so
// parallel work on a sibling project (which uses 3001) doesn't collide. This
// mirrors the per-project Postgres ports (rk-nz 5432 / westgate 5433). Every
// other consumer (Playwright's baseURL, the next/image + Payload media-URL
// fallbacks) reads process.env.PORT too, so the port lives in one place.
import { spawn } from 'node:child_process'

const port = process.env.PORT || '3000'
const child = spawn('next', ['dev', '-p', port], { stdio: 'inherit', shell: true })
child.on('exit', (code) => process.exit(code ?? 0))

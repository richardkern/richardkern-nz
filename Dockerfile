# Deploy image for Coolify (staging and production).
#
# The builder stage needs a reachable Postgres: `payload migrate` runs first,
# then `next build` statically generates pages via the Payload Local API.
# In Coolify, mark DATABASE_URL / PAYLOAD_SECRET / CRON_SECRET /
# NEXT_PUBLIC_SERVER_URL as build-time variables so they arrive as build args.

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat && npm install -g pnpm@11
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL
ARG PAYLOAD_SECRET
ARG CRON_SECRET
ARG NEXT_PUBLIC_SERVER_URL
# Umami analytics (first-party proxy). UMAMI_HOST_URL is the proxy target baked
# into the next.config rewrites at build; NEXT_PUBLIC_UMAMI_WEBSITE_ID is inlined.
# Both must be set at build time for the tracker to render (production only).
ARG UMAMI_HOST_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
# R2 vars keep the build-time Payload config identical to runtime
# (media collection storage switches on when all four are present)
ARG R2_BUCKET
ARG R2_ACCOUNT_ID
ARG R2_ACCESS_KEY_ID
ARG R2_SECRET_ACCESS_KEY
ENV DATABASE_URL=$DATABASE_URL \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    CRON_SECRET=$CRON_SECRET \
    NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    UMAMI_HOST_URL=$UMAMI_HOST_URL \
    NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID \
    R2_BUCKET=$R2_BUCKET \
    R2_ACCOUNT_ID=$R2_ACCOUNT_ID \
    R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID \
    R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm migrate && pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Not a standalone build: `next start` loads next.config.ts (which imports
# redirects.ts) and serves from .next, so the full node_modules comes along.
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=node:node /app/redirects.ts ./redirects.ts
COPY --from=builder --chown=node:node /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next

USER node
EXPOSE 3000

CMD ["./node_modules/.bin/next", "start"]

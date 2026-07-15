/**
 * Dev-only test data so every frontend surface has content behind it.
 * Run against a freshly wiped database:
 *
 *   docker compose down -v && docker compose up -d
 *   ./node_modules/.bin/tsx scripts/seed-dev.ts
 *
 * Use tsx, not `payload run` (it exits silently in this repo); the script
 * loads dotenv itself. Intended for a fresh database, not an incremental reseed.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '../src/payload.config'

const DEV_USER = {
  email: 'richard.kern@gmail.com',
  password: 'localpassword',
}

type TextNode = {
  type: 'text'
  text: string
  detail: number
  format: number
  mode: 'normal'
  style: string
  version: 1
}

const text = (t: string, format = 0): TextNode => ({
  type: 'text',
  text: t,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (...children: TextNode[]) => ({
  type: 'paragraph',
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

const codeBlock = (fields: { filename?: string; language: string; code: string }) => ({
  type: 'block',
  fields: { blockName: '', blockType: 'code', ...fields },
  format: '' as const,
  version: 2,
})

const richText = (...children: unknown[]) =>
  ({
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as any

/** 16:10 paper-toned placeholder PNG with diagonal stripes, like the mocks */
const placeholderPng = async (label: string): Promise<Buffer> => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
    <defs>
      <pattern id="stripes" width="28" height="28" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="#ECE9E1"/>
        <rect width="14" height="28" fill="#F1EEE7"/>
      </pattern>
    </defs>
    <rect width="1280" height="800" fill="url(#stripes)"/>
    <text x="640" y="408" font-family="Menlo, monospace" font-size="22" text-anchor="middle" fill="#5E6459">${label}</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function run() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding dev data...')

  // ── User ──
  const users = await payload.find({ collection: 'users', limit: 1 })
  if (users.totalDocs === 0) {
    await payload.create({ collection: 'users', data: { ...DEV_USER, name: 'Richard Kern' } })
    payload.logger.info(`Created user ${DEV_USER.email} (password: ${DEV_USER.password})`)
  }

  // ── Globals ──
  await payload.updateGlobal({
    context: { disableRevalidate: true },
    slug: 'site-settings',
    data: {
      siteTitle: 'richardkern.nz',
      bio: 'Product manager in Auckland. Builds web things, runs long distances, writes down what he learns.',
      byline: 'Richard Kern writes about homelab, agents, and running.',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/richardkern' },
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/richardkern' },
        { platform: 'Email', url: 'richard@richardkern.nz' },
      ],
    },
  })

  const navItems = [
    { link: { type: 'custom' as const, label: 'Posts', url: '/posts' } },
    { link: { type: 'custom' as const, label: 'Work', url: '/work' } },
    { link: { type: 'custom' as const, label: 'About', url: '/about' } },
  ]
  await payload.updateGlobal({ context: { disableRevalidate: true }, slug: 'header', data: { navItems } })
  await payload.updateGlobal({ context: { disableRevalidate: true }, slug: 'footer', data: { navItems } })

  // ── Tags ──
  const tagSlugs = ['homelab', 'ai-agents', 'web', 'running'] as const
  const tags: Record<string, number> = {}
  for (const slug of tagSlugs) {
    const doc = await payload.create({
      collection: 'tags',
      data: { name: slug, slug },
    })
    tags[slug] = doc.id
  }

  // ── Media (placeholder covers + gallery) ──
  const media: Record<string, number> = {}
  for (const [key, label] of [
    ['harbour-cover', 'cover — harbour watch'],
    ['rackline-cover', 'cover — rackline'],
    ['site-cover', 'cover — this site'],
    ['gallery-1', 'gallery 01'],
    ['gallery-2', 'gallery 02'],
  ] as const) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: label },
      file: {
        data: await placeholderPng(label),
        name: `${key}.png`,
        mimetype: 'image/png',
        size: 0,
      },
    })
    media[key] = doc.id
  }

  // ── Posts (entry N° is chronological, so order matters) ──
  const posts: {
    title: string
    slug: string
    publishedAt: string
    description: string
    tags: number[]
    content: ReturnType<typeof richText>
  }[] = [
    {
      title: 'Hello, notebook',
      slug: 'hello-notebook',
      publishedAt: '2026-02-08T09:00:00.000Z',
      description: 'Why this site exists and what will end up in it.',
      tags: [tags.web],
      content: richText(
        paragraph(
          text(
            'This site is a notebook in public. Posts are working notes — homelab incidents, agents that misbehave, the odd training block — written down mostly so future-me can find them again.',
          ),
        ),
      ),
    },
    {
      title: 'A rack in the garage',
      slug: 'a-rack-in-the-garage',
      publishedAt: '2026-02-22T09:00:00.000Z',
      description: 'The homelab, catalogued: what runs where and why.',
      tags: [tags.homelab],
      content: richText(
        paragraph(
          text(
            'The rack started as one mini PC and a switch. It is now a small stack of machines with names, opinions, and a shared talent for failing on long weekends.',
          ),
        ),
      ),
    },
    {
      title: 'Backups you can actually restore',
      slug: 'backups-you-can-actually-restore',
      publishedAt: '2026-03-14T09:00:00.000Z',
      description: 'A backup is a rumour until you have restored from it.',
      tags: [tags.homelab],
      content: richText(
        paragraph(
          text(
            'Every backup strategy looks fine until the afternoon you need it. This is the restore drill I now run quarterly, and what the first drill found.',
          ),
        ),
      ),
    },
    {
      title: 'Small sites, real stacks',
      slug: 'small-sites-real-stacks',
      publishedAt: '2026-04-19T09:00:00.000Z',
      description: 'Why the church website runs the same stack as everything else.',
      tags: [tags.web],
      content: richText(
        paragraph(
          text(
            'A small site does not need a small stack — it needs a boring one. Next.js, Payload, and Postgres on a VPS is boring in exactly the right way.',
          ),
        ),
      ),
    },
    {
      title: 'Notes from a 30km training block',
      slug: 'notes-from-a-30km-training-block',
      publishedAt: '2026-06-02T09:00:00.000Z',
      description: 'Slowing down on purpose is still the hardest workout on the plan.',
      tags: [tags.running],
      content: richText(
        paragraph(
          text(
            'The plan says easy. The watch says slower. Six weeks of long harbour loops later, the easy runs are finally easy — and the hard ones are finally hard.',
          ),
        ),
      ),
    },
    {
      title: 'An agent that plans before it acts',
      slug: 'an-agent-that-plans-before-it-acts',
      publishedAt: '2026-06-14T09:00:00.000Z',
      description:
        'One extra model call, half the recovery work. On making agents name their assumptions before they touch a tool.',
      tags: [tags['ai-agents'], tags.homelab],
      content: richText(
        paragraph(
          text(
            'Most of the agents I’ve built this year share a flaw: they act immediately. Give them a task and they reach for the first tool in sight, then spend the rest of the run recovering from that first move. The fix turned out to be embarrassingly old-fashioned — make the thing write a plan before it’s allowed to touch anything.',
          ),
        ),
        paragraph(
          text(
            'The planning step is a single prompt. It costs one model call and saves five. What surprised me was how much the ',
          ),
          text('shape', 2),
          text(
            ' of the plan mattered: a flat list of steps performed noticeably worse than a plan that named its assumptions first.',
          ),
        ),
        codeBlock({
          filename: 'plan.ts',
          language: 'typescript',
          code: `// Ask for assumptions before steps
const plan = await model.complete({
  system: 'Name your assumptions, then plan.',
  prompt: task,
  stop: ['BEGIN EXECUTION'],
})`,
        }),
        paragraph(
          text(
            'Once the assumptions were explicit, half of them were visibly wrong before the agent ran at all — and cheap to correct. The agent stopped digging holes it would later need to climb out of.',
          ),
        ),
      ),
    },
    {
      title: 'What my homelab taught me about failure domains',
      slug: 'what-my-homelab-taught-me-about-failure-domains',
      publishedAt: '2026-06-28T09:00:00.000Z',
      description:
        'Three outages later, the rack finally taught me what my architecture diagrams could not: blast radius is a budgeting decision.',
      tags: [tags.homelab],
      content: richText(
        paragraph(
          text(
            'Three outages later, the rack finally taught me what my architecture diagrams could not: blast radius is a budgeting decision. You do not choose whether things fail — you choose how much fails together.',
          ),
        ),
        paragraph(
          text(
            'The DNS box, the reverse proxy, and the container host were three logical services on one physical machine. On the diagram they were separate. At 6:40 on a Tuesday morning they were one very quiet garage.',
          ),
        ),
      ),
    },
  ]

  for (const post of posts) {
    await payload.create({
      collection: 'posts',
      context: { disableRevalidate: true },
      data: {
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        tags: post.tags,
        content: post.content,
        meta: { title: post.title, description: post.description },
        _status: 'published',
      },
    })
  }

  // ── Projects ──
  await payload.create({
    collection: 'projects',
    context: { disableRevalidate: true },
    data: {
      title: 'Harbour Watch',
      slug: 'harbour-watch',
      description: 'Tide and weather dashboard for Auckland harbour runs.',
      year: 2026,
      featured: true,
      status: 'published',
      tech: [{ label: 'next.js' }, { label: 'open data' }, { label: 'vps' }],
      url: 'https://example.com',
      repoUrl: 'https://github.com/richardkern',
      coverImage: media['harbour-cover'],
      images: [{ image: media['gallery-1'] }, { image: media['gallery-2'] }],
      tags: [tags.web],
      longDescription: richText(
        paragraph(
          text(
            'Harbour Watch started as a spreadsheet of tide windows for morning runs along the waterfront. It grew into a small dashboard that folds tide, wind, and rain into one answer: is the harbour loop worth it today?',
          ),
        ),
        paragraph(
          text(
            'The interesting decisions were about restraint — one screen, no accounts, aggressive caching of the open data feeds so the VPS does almost no work.',
          ),
        ),
      ),
    },
  })

  await payload.create({
    collection: 'projects',
    context: { disableRevalidate: true },
    data: {
      title: 'Rackline',
      slug: 'rackline',
      description: 'Homelab inventory and runbooks in one place.',
      year: 2025,
      featured: true,
      status: 'published',
      tech: [{ label: 'go' }, { label: 'docker' }, { label: 'postgres' }],
      repoUrl: 'https://github.com/richardkern',
      coverImage: media['rackline-cover'],
      tags: [tags.homelab],
      longDescription: richText(
        paragraph(
          text(
            'Rackline keeps the answer to “what is that machine and why does it exist” out of my head and in one place: inventory, network map, and the runbooks for the failures that have already happened once.',
          ),
        ),
      ),
    },
  })

  await payload.create({
    collection: 'projects',
    context: { disableRevalidate: true },
    data: {
      title: 'This site',
      slug: 'this-site',
      description: 'richardkern.nz — the notebook you are reading.',
      year: 2026,
      featured: false,
      status: 'published',
      tech: [{ label: 'next.js' }, { label: 'payload' }, { label: 'postgres' }],
      repoUrl: 'https://github.com/richardkern/richardkern-nz',
      coverImage: media['site-cover'],
      tags: [tags.web],
      longDescription: richText(
        paragraph(
          text(
            'A personal site and blog on the house stack: Next.js App Router, Payload CMS, Postgres, deployed to a VPS through Coolify.',
          ),
        ),
      ),
    },
  })

  // ── About page ──
  await payload.create({
    collection: 'pages',
    context: { disableRevalidate: true },
    data: {
      title: 'About',
      slug: 'about',
      _status: 'published',
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: richText(
                paragraph(
                  text(
                    'I’m Richard — a product manager in Auckland, New Zealand. By day I work on software products; the rest of the time I run a small homelab, build web things for people I know, and train for long runs around the harbour.',
                  ),
                ),
                paragraph(
                  text(
                    'This site is my notebook in public. The posts are working notes — homelab incidents, AI agents that misbehave, the odd training block — written down mostly so future-me can find them again.',
                  ),
                ),
                paragraph(
                  text(
                    'Current toolkit: Next.js, Payload, Postgres, a VPS that hums along, and a rack in the garage that occasionally doesn’t.',
                  ),
                ),
              ),
            },
          ],
        },
      ],
      meta: {
        title: 'About',
        description: 'Who Richard Kern is and what he works with.',
      },
    },
  })

  payload.logger.info('Seed complete.')
  process.exit(0)
}

void run()

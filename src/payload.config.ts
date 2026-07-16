import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Tags } from './collections/Tags'
import { Technologies } from './collections/Technologies'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { secretEqual } from './utilities/secretEqual'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Dev uses schema push (Payload default); staging/production run these
    // migrations during the deploy build. See AGENTS.md "Conventions".
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  collections: [Pages, Posts, Projects, Media, Tags, Technologies, Users],
  cors: [getServerSideURL()].filter(Boolean),
  // Real email only when the key is present (staging/production); without it
  // Payload falls back to logging emails to the console, which is what dev wants.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: 'noreply@richardkern.nz',
        defaultFromName: 'Richard Kern',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  serverURL: getServerSideURL(),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return secretEqual(authHeader, `Bearer ${secret}`)
      },
    },
    tasks: [],
  },
})

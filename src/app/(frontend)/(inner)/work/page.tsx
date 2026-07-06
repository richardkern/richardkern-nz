import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-year',
    select: {
      title: true,
      slug: true,
      description: true,
      year: true,
      tech: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Work</h1>
        </div>
      </div>

      <div className="container">
        {projects.totalDocs === 0 ? (
          <p className="text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-4 lg:gap-8">
            {projects.docs.map((project) => (
              <div className="col-span-4" key={project.id}>
                <Link href={`/work/${project.slug}`}>
                  <div className="border border-border rounded-lg p-4 hover:bg-card transition-colors">
                    <h2 className="font-semibold text-lg">{project.title}</h2>
                    {project.year && (
                      <p className="text-sm text-muted-foreground mt-1">{project.year}</p>
                    )}
                    {project.description && (
                      <p className="mt-2 text-sm">{project.description}</p>
                    )}
                    {project.tech && project.tech.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {project.tech.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs border border-border rounded px-2 py-0.5"
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Work',
  }
}

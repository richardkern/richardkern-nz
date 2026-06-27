import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [postsResult, projectsResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        meta: true,
        publishedAt: true,
      },
    }),
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      sort: '-year',
      where: {
        featured: {
          equals: true,
        },
      },
      select: {
        title: true,
        slug: true,
        description: true,
        year: true,
        tech: true,
      },
    }),
  ])

  const recentPosts = postsResult.docs
  const featuredProjects = projectsResult.docs

  return (
    <div className="pt-24 pb-24">
      {/* Featured projects */}
      <section className="container mb-24">
        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Work</h2>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-4 lg:gap-8">
            {featuredProjects.map((project) => (
              <div className="col-span-4" key={project.id}>
                <Link href={`/work/${project.slug}`}>
                  <div className="border border-border rounded-lg p-4 hover:bg-card transition-colors">
                    <h3 className="font-semibold">{project.title}</h3>
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
        ) : (
          <p className="text-muted-foreground">No featured projects yet.</p>
        )}

        <div className="mt-8">
          <Link href="/work" className="underline text-sm">
            All work →
          </Link>
        </div>
      </section>

      {/* Recent posts */}
      <section className="container">
        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Writing</h2>
        </div>

        {recentPosts.length > 0 ? (
          <div className="flex flex-col gap-4 max-w-2xl">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.slug}`}>
                <div className="border border-border rounded-lg p-4 hover:bg-card transition-colors">
                  <h3 className="font-semibold">{post.title}</h3>
                  {post.meta?.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{post.meta.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No posts yet.</p>
        )}

        <div className="mt-8">
          <Link href="/posts" className="underline text-sm">
            All posts →
          </Link>
        </div>
      </section>
    </div>
  )
}

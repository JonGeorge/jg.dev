import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import { getPostBySlug, getPostSlugs, getAdjacentPosts } from '@/lib/writing'

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const {slug} = await params

  try {
    const post = getPostBySlug(slug)
    const ogImage = `/images/writing/${slug}/og.png`

    return {
      title: `${post.frontmatter.title} — Jon George`,
      description: post.frontmatter.description || post.content.slice(0, 160),
      openGraph: {
        title: post.frontmatter.title,
        description: post.frontmatter.description || post.content.slice(0, 160),
        type: 'article',
        publishedTime: post.frontmatter.date,
        locale: 'en_US',
        url: `https://jg.dev/writing/${slug}`,
        authors: [post.frontmatter.author],
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.frontmatter.title,
          },
        ],
        ...(post.frontmatter.updated && {
          modifiedTime: post.frontmatter.updated,
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.frontmatter.title,
        description: post.frontmatter.description || post.content.slice(0, 160),
        images: [ogImage],
        site: '@jongeorgedev',
        creator: '@jongeorgedev',
      },
    }
  } catch {
    return {}
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let post
  try {
    post = getPostBySlug(slug)
  } catch {
    notFound()
  }

  const { frontmatter, content } = post
  const { prev, next } = getAdjacentPosts(slug)
  const date = new Date(frontmatter.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const updated = frontmatter.updated ? new Date(frontmatter.updated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : ""

  return (
    <article className="max-w-[720px] mx-auto">
      <Link
        href="/writing"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200 mb-8"
      >
        &larr; Writing
      </Link>

      <header className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
          {frontmatter.title}
        </h1>
        <div className="font-mono text-sm text-[var(--color-text-muted)]">
          <time dateTime={frontmatter.date}>{date}</time>
          {frontmatter.updated && (
              <> &middot; Updated <time dateTime={frontmatter.updated}>{updated}</time> </>
          )}

          {frontmatter.category && (
            <> &middot; {frontmatter.category}</>
          )}
        </div>
      </header>

      <div className="prose">
        {/*Code themes at: https://shiki.style/themes#themes*/}
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypePrettyCode, {
                  theme: {
                    light: 'github-light-high-contrast',
                    dark: 'min-dark'
                  }
                }],
              ],
            },
          }}
        />
      </div>

      <nav className="mt-12 pt-8 border-t border-[var(--color-border)]">
        <div className="flex justify-between gap-8">
          {prev ? (
            <Link
              href={`/writing/${prev.slug}`}
              className="group text-left max-w-[48%]"
            >
              <span className="font-mono text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-200">
                &larr; Previous
              </span>
              <span className="block text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-200 mt-1">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/writing/${next.slug}`}
              className="group text-right max-w-[48%] ml-auto"
            >
              <span className="font-mono text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-200">
                Next &rarr;
              </span>
              <span className="block text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-200 mt-1">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/writing"
            className="font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
          >
            &larr; Writing
          </Link>
        </div>
      </nav>
    </article>
  )
}

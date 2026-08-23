import { getAllPosts } from '@/lib/writing'
import { HomePage } from '@/components/HomePage'

export default function Home() {
    const featuredPosts: string[] = [
      "process-1-million-plus-records-in-servicenow",
      "the-five-dimensions-of-cognitive-work",
      "slow-cook-your-ideas",
      "zero-trust-in-code",
      "building-a-residuality-theory-tool-in-rust"
    ];

    const recentPosts = getAllPosts()
        .filter((post) => featuredPosts.includes(post.slug))
        .map((post) => ({
            slug: post.slug,
            title: post.frontmatter.title,
            date: new Date(post.frontmatter.updated || post.frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        }))

    return <HomePage recentPosts={recentPosts} />
}

import { getAllPosts } from '@/lib/writing'
import { HomePage } from '@/components/HomePage'

export default function Home() {
    const featuredPosts: string[] = [
        // "the-myths-and-realities-of-open-source-software-security",
        // "from-black-box-to-open-book-using-net-logs-to-understand-your-browsers-behavior",
        "are-larger-monolithic-functions-actually-better",
        "cognitive-debt",
        "the-five-dimensions-of-cognitive-work",
        "send-cyber-junk-to-your-pi-hole-2",
        "slow-cook-your-ideas"
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

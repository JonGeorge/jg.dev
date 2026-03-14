import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import matter from 'gray-matter'
import {Feed} from 'feed'
import {marked} from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'writing')
const PUBLIC_DIR = path.join(ROOT, 'public')

const SITE = 'https://jg.dev'

const author = {
    name: 'feed@jg.dev',
    link: SITE,
}

// Enable GFM (tables, strikethrough, etc.) to match the site's rendering
marked.use({ gfm: true })

// Read and sort posts (same logic as generate-sitemap.mjs)
const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))

const posts = files
    .map((file) => {
        const slug = file.replace(/\.md$/, '')
        const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8')
        const {data, content} = matter(raw)
        return {
            slug,
            title: data.title,
            description: data.description || '',
            date: new Date(data.updated || data.date),
            category: data.category || '',
            image: fs.existsSync(`${PUBLIC_DIR}/images/writing/${slug}/og.png`) ? `${SITE}/images/writing/${slug}/og.png` : undefined,
            content,
        }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())

const latestDate = posts[0]?.date || new Date()

const feed = new Feed({
    title: 'Jon George',
    description: 'Technical leader and product builder. Building SoftwareDB.',
    id: SITE,
    link: SITE,
    language: 'en',
    image: `${SITE}/512x512.png`,
    favicon: `${SITE}/32x32.png`,
    copyright: `© ${new Date().getFullYear()} Jon George`,
    updated: latestDate,
    feedLinks: {
        rss: `${SITE}/feed.xml`,
        atom: `${SITE}/feed.atom`,
        json: `${SITE}/feed.json`,
    },
    author,
})

for (const post of posts) {
    // Strip rehype-pretty-code inline language hints (e.g. `code{:js}` → `code`)
    // before marked parses the markdown, since marked doesn't understand them.
    const cleanedContent = post.content.replace(/`([^`]+)\{:\w+\}`/g, '`$1`')

    // Convert markdown body to HTML for full-content feeds
    const html = await marked.parse(cleanedContent)

    const htmlAbsoluteSrc = html.replace(/src="\/images\//g, `src="${SITE}/images/`);
    const htmlAbsoluteSrcAndHref = htmlAbsoluteSrc.replace(/href="\//g, `href="${SITE}/`);
    const htmlAbsoluteSrcAndHrefWithBrs = htmlAbsoluteSrcAndHref.replace(/\n/g, '<br>');

    feed.addItem({
        title: post.title,
        id: `${SITE}/writing/${post.slug}`,
        link: `${SITE}/writing/${post.slug}`,
        description: post.description,
        content: htmlAbsoluteSrcAndHrefWithBrs,
        date: post.date,
        author: [author],
        ...(post.category && {
            category: [{name: post.category}],
        }),
        ...(post.image && {
            image: post.image,
        }),
    })
}

// feed v5.2.0 has a bug where xml-js compact mode serializes the
// author "name" element as "<n>" in Atom output. Fix via replaceAll.
const atomOutput = feed
    .atom1()
    .replaceAll('<n>', '<name>')
    .replaceAll('</n>', '</name>')

fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.xml'), feed.rss2())
fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.atom'), atomOutput)
fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.json'), feed.json1())

console.log(`Feeds written to public/ (${posts.length} posts)`)
console.log('  → feed.xml  (RSS 2.0)')
console.log('  → feed.atom (Atom 1.0)')
console.log('  → feed.json (JSON Feed)')

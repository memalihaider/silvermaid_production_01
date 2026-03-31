import { ArrowLeft, Clock, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { AnimatedDiv, AnimatedArticle, AnimatedAside, ShareButton } from './client-parts'

const SITE_URL = 'https://silvermaid-production-01.vercel.app'

type BlogCategory = {
  id: string
  slug: string
  name: string
  color: string
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  p1: string
  h2: string
  p2: string
  image: string
  category: string
  readTime: number
  author: string
  publishedAt: string
  featured: boolean
  promotionalImages?: string[]
  ctaImage?: string
  seoTitle?: string
  canonicalUrl?: string
}

function toSlug(title: string, id: string) {
  return title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${id}`
}

function splitContentAtH2(content: string) {
  const decoded = decodeMaybeUrlEncoded(content)
  const paragraphs = decoded.split('\n\n').filter(p => p.trim())
  const h2Index = paragraphs.findIndex(p => /^##\s/.test(p))
  if (h2Index <= 0) {
    const splitAt = Math.max(1, Math.floor(paragraphs.length / 3))
    return { p1: paragraphs.slice(0, splitAt), h2: null, p2: paragraphs.slice(splitAt) }
  }
  return {
    p1: paragraphs.slice(0, h2Index),
    h2: paragraphs[h2Index].replace(/^#+\s/, ''),
    p2: paragraphs.slice(h2Index + 1),
  }
}

function decodeMaybeUrlEncoded(value: string) {
  if (!value) return value
  if (!/%[0-9A-Fa-f]{2}/.test(value)) return value
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function sanitizeInlineHtml(value: string) {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)=("|')\s*javascript:[^"']*\2/gi, '')
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, '').trim()
}

function formatInlineRichText(value: string) {
  const decoded = decodeMaybeUrlEncoded(value)
  const withMarkdownFormatting = decoded
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline hover:text-blue-800">$1</a>')

  return sanitizeInlineHtml(withMarkdownFormatting)
}

async function fetchAllPosts() {
  const catSnap = await getDocs(collection(db, 'blog-categories'))
  const cats: BlogCategory[] = catSnap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as { slug: string; name: string; color: string })
  }))

  const q = query(collection(db, 'blog-post'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)

  const posts: BlogPost[] = snap.docs.map(doc => {
    const d = doc.data()
    return {
      id: doc.id,
      title: d.title || '',
      slug: toSlug(d.title, doc.id),
      excerpt: d.description ? d.description.substring(0, 150) + '...' : '',
      content: d.content || '',
      p1: d.p1 || '',
      h2: d.h2 || '',
      p2: d.p2 || '',
      image: d.imageURL || '',
      category: d.category || d.tags?.[0]?.toLowerCase()?.replace(/\s+/g, '-') || 'general',
      readTime: d.readTime || 5,
      author: d.name || 'Admin',
      publishedAt: d.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      featured: d.featured || false,
      promotionalImages: d.promotionalImages || [],
      ctaImage: d.ctaImage || '',
      seoTitle: d.seoTitle || '',
      canonicalUrl: d.canonicalUrl || '',
    }
  })

  return { posts, cats }
}

// --- SEO: Dynamic Metadata ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const { posts } = await fetchAllPosts()
    const post = posts.find(p => p.slug === slug)

    if (!post) {
      return { title: 'Post Not Found | Silver Maid' }
    }

    const rawTitle = post.seoTitle?.trim() || post.title
    const safeTitle = stripTags(decodeMaybeUrlEncoded(rawTitle))
    const metaTitle = post.seoTitle?.trim()
      ? safeTitle
      : `${safeTitle} | Silver Maid Blog`
    const rawDescription = post.excerpt || `Read "${post.title}" on the Silver Maid blog.`
    const metaDescription = stripTags(decodeMaybeUrlEncoded(rawDescription))
    const canonicalUrl = post.canonicalUrl?.trim() || `${SITE_URL}/${post.slug}`

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'Silver Maid',
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author],
        ...(post.image ? { images: [{ url: post.image, width: 1200, height: 630, alt: post.title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        ...(post.image ? { images: [post.image] } : {}),
      },
      alternates: {
        canonical: canonicalUrl,
      },
    }
  } catch {
    return { title: 'Blog | Silver Maid' }
  }
}

// --- Render helpers ---
function renderParagraph(paragraph: string, index: number) {
  const decoded = decodeMaybeUrlEncoded(paragraph)
  if (decoded.startsWith('- ')) {
    const items = decoded.split('\n').filter(item => item.startsWith('- '))
    return (
      <ul key={index} className="list-disc list-inside space-y-2 my-6 text-slate-700 [&_a]:text-blue-700 [&_a]:underline [&_a:hover]:text-blue-800">
        {items.map((item, j) => (
          <li
            key={j}
            className="font-medium"
            dangerouslySetInnerHTML={{ __html: formatInlineRichText(item.replace('- ', '')) }}
          />
        ))}
      </ul>
    )
  }
  if (decoded.match(/^\d+\./)) {
    return (
      <ol key={index} className="list-decimal list-inside space-y-2 my-6 text-slate-700 [&_a]:text-blue-700 [&_a]:underline [&_a:hover]:text-blue-800">
        {decoded.split('\n').filter(l => l.trim()).map((line, j) => (
          <li
            key={j}
            className="font-medium"
            dangerouslySetInnerHTML={{ __html: formatInlineRichText(line.replace(/^\d+\.\s/, '')) }}
          />
        ))}
      </ol>
    )
  }
  if (decoded.match(/^#{1,3}\s/)) {
    const level = decoded.match(/^#+/)?.[0].length || 1
    const text = decoded.replace(/^#+\s/, '')
    const cls = level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'
    return <h2 key={index} className={`${cls} font-black text-slate-900 mt-8 mb-4`}>{text}</h2>
  }
  const html = formatInlineRichText(decoded)
  if (/<\w[\s\S]*?>/.test(html)) {
    return (
      <p
        key={index}
        className="text-slate-700 font-medium leading-relaxed text-lg mb-6 [&_a]:text-blue-700 [&_a]:underline [&_a:hover]:text-blue-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return (
    <p key={index} className="text-slate-700 font-medium leading-relaxed text-lg mb-6">
      {decoded}
    </p>
  )
}

// --- Page Component (Server Component) ---
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let post: BlogPost | undefined
  let relatedPosts: BlogPost[] = []
  let cats: BlogCategory[] = []

  try {
    const result = await fetchAllPosts()
    cats = result.cats
    post = result.posts.find(p => p.slug === slug)
    if (post) {
      relatedPosts = result.posts
        .filter(p => p.category === post!.category && p.id !== post!.id)
        .slice(0, 3)
    }
  } catch (err) {
    console.error('Error fetching blog post:', err)
  }

  if (!post) notFound()

  // Structured fields or fallback
  const hasStructuredContent = !!(post.p1 || post.h2 || post.p2)
  const legacy = splitContentAtH2(post.content)

  const p1Paragraphs = hasStructuredContent
    ? (post.p1 || '').split('\n\n').filter(p => p.trim())
    : legacy.p1
  const h2Text = hasStructuredContent ? (post.h2 || null) : legacy.h2
  const p2Paragraphs = hasStructuredContent
    ? (post.p2 || '').split('\n\n').filter(p => p.trim())
    : legacy.p2

  const promoImages = post.promotionalImages || []
  const ctaImage = post.ctaImage || ''

  const matchedCat = cats.find(c => c.slug === post.category)
  const categoryColor = matchedCat
    ? `${matchedCat.color} ${matchedCat.color.replace('100', '700').replace('bg-', 'text-')}`
    : 'bg-slate-500 text-white'

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: stripTags(decodeMaybeUrlEncoded(post.title)),
    description: stripTags(decodeMaybeUrlEncoded(post.excerpt || '')),
    image: post.image || undefined,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Silver Maid',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl?.trim() || `${SITE_URL}/${post.slug}`,
    },
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* JSON-LD for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Slim Hero — Title & Meta */}
      <section className="py-16 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold transition-colors mb-8"
              >
                <ArrowLeft className="h-5 w-5" /> Back to Blog
              </Link>
              <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${categoryColor}`}>
                {post.category.replace(/-/g, ' ')}
              </span>
              <h1
                className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-8"
                dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(decodeMaybeUrlEncoded(post.title)) }}
              />
              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <span>•</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </section>

      {/* Article + Sidebar */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Article */}
            <AnimatedArticle className="lg:col-span-2">
              {/* Featured Image */}
              {post.image && (
                <div className="w-full rounded-2xl overflow-hidden mb-10 aspect-video">
                  <img
                    src={post.image}
                    alt={stripTags(decodeMaybeUrlEncoded(post.title))}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* P1 */}
              <div className="prose prose-lg max-w-none mb-10">
                {p1Paragraphs.map((paragraph, i) => renderParagraph(paragraph, i))}
              </div>

              {/* Promotional Images */}
              {promoImages.length > 0 && (
                <div className={`grid gap-4 mb-10 ${promoImages.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {promoImages.slice(0, 2).map((src, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden aspect-video">
                      <img src={src} alt={`Promotional image ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* H2 Section Heading */}
              {h2Text && (
                <h2
                  className="text-3xl font-black text-slate-900 mt-4 mb-8 pb-4 border-b-2 border-primary/20"
                  dangerouslySetInnerHTML={{ __html: formatInlineRichText(h2Text) }}
                />
              )}

              {/* CTA Image */}
              {ctaImage && (
                <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-xl">
                  <img src={ctaImage} alt="Call to action" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* P2 */}
              <div className="prose prose-lg max-w-none">
                {p2Paragraphs.map((paragraph, i) => renderParagraph(paragraph, i + p1Paragraphs.length + 1))}
              </div>

              {/* Share */}
              <div className="mt-12 pt-8 border-t-2 border-slate-200 flex items-center gap-4">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Share:</span>
                <ShareButton title={post.title} />
              </div>
            </AnimatedArticle>

            {/* Sidebar */}
            <AnimatedAside className="lg:col-span-1">
              <div className="bg-primary/10 border-2 border-primary rounded-2xl p-8 sticky top-24 mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-3">Need Professional Cleaning?</h3>
                <p className="text-sm text-slate-700 mb-6">
                  Our expert team can help keep your space clean and healthy.
                </p>
                <Link
                  href="/book-service"
                  className="block w-full bg-primary text-white px-6 py-4 rounded-xl font-black text-center hover:bg-pink-600 transition-colors"
                >
                  Book Now
                </Link>
              </div>

              {relatedPosts.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h3 className="text-lg font-black text-slate-900 mb-6">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map(related => (
                      <Link
                        key={related.id}
                        href={`/${related.slug}`}
                        className="group flex items-start gap-3 p-4 rounded-lg hover:bg-white transition-colors"
                      >
                        {related.image && (
                          <img
                            src={related.image}
                            alt={stripTags(decodeMaybeUrlEncoded(related.title))}
                            className="h-16 w-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="flex-1">
                          <h4
                            className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(decodeMaybeUrlEncoded(related.title)) }}
                          />
                          <p className="text-xs text-slate-500 mt-1">{related.readTime} min read</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors mt-1 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </AnimatedAside>
          </div>
        </div>
      </section>

      {/* More Posts CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-6">Explore More Cleaning Insights</h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-primary px-8 py-4 rounded-2xl font-black hover:bg-pink-600 transition-colors"
          >
            Read All Articles <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

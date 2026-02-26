'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Clock, User, Share2, ChevronRight, Tag } from 'lucide-react'
import Link from 'next/link'
import { INITIAL_BLOG_POSTS } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// ─── Types ──────────────────────────────────────────────────────────────────

type FirebaseBlogPost = {
  id: string
  title: string
  name: string
  description: string
  content: string
  readTime: number
  imageURL: string
  featured: boolean
  tags: string[]
  createdAt: any
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  readTime: number
  author: string
  publishedAt: string
  featured: boolean
  authorImage?: string
}

// ─── Category colour helpers ─────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  'cleaning-tips': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'how-to': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'industry-news': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'home-care': { bg: 'bg-green-100', text: 'text-green-700' },
  'deep-cleaning': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'customer-stories': { bg: 'bg-teal-100', text: 'text-teal-700' },
}
const defaultStyle = { bg: 'bg-pink-100', text: 'text-pink-700' }

function categoryStyle(category: string) {
  return CATEGORY_STYLES[category] || defaultStyle
}

// ─── Slug generator (must match the one used when posts were saved) ───────────

function makeSlug(title: string, fallbackId: string) {
  return (
    title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `post-${fallbackId}`
  )
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function RootBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // 1. Fetch Firebase posts
        const snapshot = await getDocs(collection(db, 'blog-post'))
        const firebasePosts: BlogPost[] = []

        snapshot.forEach((doc) => {
          const d = doc.data() as FirebaseBlogPost
          firebasePosts.push({
            id: doc.id,
            title: d.title || '',
            slug: makeSlug(d.title, doc.id),
            excerpt: (d.description?.substring(0, 120) ?? '') + '...',
            content: d.content || '',
            image: d.imageURL || '/api/placeholder/600/400',
            category:
              d.tags?.[0]?.toLowerCase().replace(/\s+/g, '-') || 'how-to',
            readTime: d.readTime || 5,
            author: d.name || 'Admin',
            publishedAt:
              d.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            featured: d.featured || false,
          })
        })

        // 2. Combine with static posts — Firebase first (higher priority)
        const allPosts: BlogPost[] = [
          ...firebasePosts,
          ...INITIAL_BLOG_POSTS.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            content: p.content,
            image: p.image,
            category: p.category,
            readTime: p.readTime,
            author: p.author,
            publishedAt: p.publishedAt,
            featured: p.featured,
            authorImage: (p as any).authorImage,
          })),
        ]

        // 3. Find post matching the URL slug
        const current = allPosts.find((p) => p.slug === slug)
        if (!current) {
          notFound()
          return
        }

        setPost(current)

        // 4. Related posts — same category, max 3
        setRelatedPosts(
          allPosts
            .filter((p) => p.category === current.category && p.id !== current.id)
            .slice(0, 3)
        )
      } catch (err) {
        console.error('Error loading blog post:', err)
        // Fallback to static posts only
        const fallback = INITIAL_BLOG_POSTS.find((p) => p.slug === slug)
        if (fallback) {
          setPost({
            id: fallback.id,
            title: fallback.title,
            slug: fallback.slug,
            excerpt: fallback.excerpt,
            content: fallback.content,
            image: fallback.image,
            category: fallback.category,
            readTime: fallback.readTime,
            author: fallback.author,
            publishedAt: fallback.publishedAt,
            featured: fallback.featured,
            authorImage: (fallback as any).authorImage,
          })
          setRelatedPosts(
            INITIAL_BLOG_POSTS.filter(
              (p) => p.category === fallback.category && p.id !== fallback.id
            )
              .slice(0, 3)
              .map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                image: p.image,
                category: p.category,
                readTime: p.readTime,
                author: p.author,
                publishedAt: p.publishedAt,
                featured: p.featured,
              }))
          )
        } else {
          notFound()
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  // ── Loading skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden pt-20">
        <section className="py-24 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/20 rounded-full w-1/3 mx-auto" />
              <div className="h-12 bg-white/20 rounded-xl w-3/4 mx-auto" />
              <div className="h-6 bg-white/10 rounded-xl w-1/2 mx-auto" />
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-200 rounded-lg w-full" />
          <div className="h-4 bg-slate-200 rounded-lg w-5/6" />
        </div>
      </div>
    )
  }

  if (!post) notFound()

  const { bg: catBg, text: catText } = categoryStyle(post!.category)

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      {/* Hero image with overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 md:h-125 bg-slate-900 overflow-hidden group"
      >
        <img
          src={post!.image}
          alt={post!.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Back link */}
        <div className="absolute top-8 left-4 md:left-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white hover:text-primary font-bold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Blog
          </Link>
        </div>

        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/blog/category/${post!.category}`}
              className="hover:text-white transition-colors"
            >
              {post!.category.replace(/-/g, ' ')}
            </Link>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${catBg} ${catText}`}
          >
            <Tag className="h-3 w-3" />
            {post!.category.replace(/-/g, ' ')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight max-w-4xl">
            {post!.title}
          </h1>
        </motion.div>
      </motion.div>

      {/* Content + Sidebar */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* ── Article ──────────────────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {/* Author row */}
              <div className="flex items-center gap-4 pb-8 border-b-2 border-slate-200 mb-8">
                <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {post!.authorImage ? (
                    <img
                      src={post!.authorImage}
                      alt={post!.author}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-black text-slate-900">{post!.author}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(post!.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    &bull; {post!.readTime} min read
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="prose prose-lg max-w-none">
                {post!.content.split('\n\n').map((block, i) => {
                  // Bullet list
                  if (block.startsWith('- ')) {
                    const items = block.split('\n').filter((l) => l.startsWith('- '))
                    return (
                      <ul key={i} className="list-disc list-inside space-y-2 my-6 text-slate-700">
                        {items.map((item, j) => (
                          <li key={j} className="font-medium">
                            {item.replace('- ', '')}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  // Ordered list
                  if (block.match(/^\d+\./)) {
                    const lines = block.split('\n').filter((l) => l.trim())
                    return (
                      <ol key={i} className="list-decimal list-inside space-y-2 my-6 text-slate-700">
                        {lines.map((line, j) => (
                          <li key={j} className="font-medium">
                            {line.replace(/^\d+\.\s/, '')}
                          </li>
                        ))}
                      </ol>
                    )
                  }
                  // Headings
                  if (block.match(/^#{1,3}\s/)) {
                    const level = block.match(/^#+/)?.[0].length || 1
                    const text = block.replace(/^#+\s/, '')
                    const cls =
                      level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'
                    return (
                      <h2 key={i} className={`${cls} font-black text-slate-900 mt-8 mb-4`}>
                        {text}
                      </h2>
                    )
                  }
                  // Paragraph
                  return (
                    <p key={i} className="text-slate-700 font-medium leading-relaxed text-lg mb-6">
                      {block}
                    </p>
                  )
                })}
              </div>

              {/* Share */}
              <div className="mt-12 pt-8 border-t-2 border-slate-200 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                  Share:
                </span>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post!.title, url: window.location.href })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all font-bold text-sm"
                >
                  <Share2 className="h-4 w-4" /> Copy Link
                </button>

                {/* Category link */}
                <Link
                  href={`/blog/category/${post!.category}`}
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${catBg} ${catText} hover:opacity-80`}
                >
                  <Tag className="h-4 w-4" />
                  More in {post!.category.replace(/-/g, ' ')}
                </Link>
              </div>
            </motion.article>

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              {/* Booking CTA */}
              <div className="bg-primary/10 border-2 border-primary rounded-2xl p-8 sticky top-24 mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-3">
                  Need Professional Cleaning?
                </h3>
                <p className="text-sm text-slate-700 mb-6">
                  Our expert team can help keep your space clean and healthy.
                </p>
                <Link
                  href="/book-service"
                  className="block w-full bg-primary text-white px-6 py-4 rounded-xl font-black text-center hover:bg-pink-600 transition-colors mb-3"
                >
                  Book Now
                </Link>
                <Link
                  href="/services"
                  className="block w-full border-2 border-primary text-primary px-6 py-3 rounded-xl font-black text-center hover:bg-primary/10 transition-colors text-sm"
                >
                  View All Services
                </Link>
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h3 className="text-lg font-black text-slate-900 mb-6">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        href={`/${related.slug}`}
                        className="group flex items-start gap-3 p-4 rounded-lg hover:bg-white transition-colors"
                      >
                        <img
                          src={related.image}
                          alt={related.title}
                          className="h-16 w-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {related.readTime} min read
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors mt-1 shrink-0" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/blog/category/${post!.category}`}
                    className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    See all {post!.category.replace(/-/g, ' ')} articles
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-6 tracking-tighter">
            Explore More Cleaning Insights
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-primary px-8 py-4 rounded-2xl font-black hover:bg-pink-600 transition-colors"
            >
              Read All Articles <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href={`/blog/category/${post!.category}`}
              className="inline-flex items-center gap-2 border-2 border-white/30 px-8 py-4 rounded-2xl font-black hover:border-white transition-colors"
            >
              <Tag className="h-5 w-5" /> More {post!.category.replace(/-/g, ' ')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

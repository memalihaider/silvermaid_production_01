'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { INITIAL_BLOG_POSTS } from '@/lib/blog-data'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const POSTS_PER_PAGE = 9

// Category metadata — add more as needed
const CATEGORY_META: Record<string, { label: string; description: string; color: string; bg: string }> = {
  'cleaning-tips': {
    label: 'Cleaning Tips',
    description: 'Practical advice, DIY hacks, and expert tricks to keep every surface spotless.',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  'how-to': {
    label: 'How-To Guides',
    description: 'Step-by-step guides that walk you through professional cleaning techniques.',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
  },
  'industry-news': {
    label: 'Industry News',
    description: 'Latest updates, certifications, and innovations from the cleaning industry.',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
  'home-care': {
    label: 'Home Care',
    description: 'Guides for maintaining a healthy, clean home environment all year round.',
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  'deep-cleaning': {
    label: 'Deep Cleaning',
    description: 'Professional deep cleaning methods for thorough results in every corner.',
    color: 'text-rose-700',
    bg: 'bg-rose-100',
  },
  'customer-stories': {
    label: 'Customer Stories',
    description: 'Real experiences from our clients across the UAE.',
    color: 'text-teal-700',
    bg: 'bg-teal-100',
  },
}

// Fallback for unknown categories
const defaultMeta = {
  label: '',
  description: 'Browse all posts in this category.',
  color: 'text-slate-700',
  bg: 'bg-slate-100',
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
}

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

export default function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = use(params)
  const [firebasePosts, setFirebasePosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const meta = CATEGORY_META[category] || {
    ...defaultMeta,
    label: category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }

  // Fetch Firebase posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'blog-post'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const posts: BlogPost[] = []
        snapshot.forEach((doc) => {
          const d = doc.data() as FirebaseBlogPost
          posts.push({
            id: doc.id,
            title: d.title || '',
            slug:
              d.title
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `post-${doc.id}`,
            excerpt:
              (d.description?.substring(0, 120) ?? '') + '...' || '',
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
        setFirebasePosts(posts)
      } catch (err) {
        console.error('Error fetching Firebase posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Combine Firebase + static posts filtered by category
  const allPosts: BlogPost[] = useMemo(() => {
    const combined: BlogPost[] = [
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
      })),
    ]
    return combined
      .filter((p) => p.category === category)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
  }, [firebasePosts, category])

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  const paginated = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  // All unique category slugs for the sidebar
  const allCategories = Object.keys(CATEGORY_META)

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      {/* Hero */}
      <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-bold">{meta.label}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6 ${meta.bg} ${meta.color}`}
            >
              <Tag className="inline h-3 w-3 mr-1" />
              Category
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
              {meta.label}
            </h1>
            <p className="text-xl text-slate-300 font-medium">{meta.description}</p>
            <p className="mt-4 text-sm text-slate-400">
              {loading ? '...' : allPosts.length} article{allPosts.length !== 1 ? 's' : ''} found
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Posts Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-2xl overflow-hidden border-2 border-slate-200">
                      <div className="h-48 bg-slate-200" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-5 bg-slate-200 rounded w-full" />
                        <div className="h-4 bg-slate-200 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginated.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24"
                >
                  <Tag className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-slate-900 mb-3">
                    No posts yet in this category
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Check back soon — we're always publishing fresh content.
                  </p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black hover:bg-pink-600 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" /> Back to All Articles
                  </Link>
                </motion.div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                    {paginated.map((post, i) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 flex flex-col"
                      >
                        {/* Link points to root-level slug */}
                        <Link href={`/${post.slug}`} className="flex flex-col h-full">
                          <div className="relative overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {post.featured && (
                              <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                            <div>
                              <span
                                className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color}`}
                              >
                                {meta.label}
                              </span>
                              <h3 className="text-lg font-black text-slate-900 mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-sm text-slate-600 font-medium line-clamp-2 mb-4">
                                {post.excerpt}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {post.readTime} min
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {post.author}
                              </span>
                              <span>
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 rounded-xl border-2 border-slate-200 font-bold uppercase tracking-wider hover:border-primary disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 w-10 rounded-lg font-bold transition-all ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'border-2 border-slate-200 text-slate-600 hover:border-primary'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-2 rounded-xl border-2 border-slate-200 font-bold uppercase tracking-wider hover:border-primary disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-8">
                {/* Back to Blog */}
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-slate-600 hover:text-primary font-bold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> All Articles
                </Link>

                {/* Browse Categories */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-base font-black text-slate-900 mb-4 uppercase tracking-wide">
                    Browse Categories
                  </h3>
                  <ul className="space-y-2">
                    {allCategories.map((cat) => {
                      const m = CATEGORY_META[cat]
                      return (
                        <li key={cat}>
                          <Link
                            href={`/blog/category/${cat}`}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              cat === category
                                ? `${m.bg} ${m.color}`
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span>{m.label}</span>
                            <ChevronRight className="h-4 w-4 opacity-50" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6">
                  <h3 className="text-base font-black text-slate-900 mb-2">
                    Need Professional Cleaning?
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Expert cleaning services across the UAE.
                  </p>
                  <Link
                    href="/book-service"
                    className="block w-full bg-primary text-white px-5 py-3 rounded-xl font-black text-center hover:bg-pink-600 transition-colors text-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

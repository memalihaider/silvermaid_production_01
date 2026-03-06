'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Clock, User, Share2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

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

function toSlug(title: string, id: string) {
  return title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${id}`
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
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
            image: d.imageURL || '',
            category: d.tags?.[0]?.toLowerCase()?.replace(/\s+/g, '-') || 'general',
            readTime: d.readTime || 5,
            author: d.name || 'Admin',
            publishedAt: d.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            featured: d.featured || false,
          }
        })

        const current = posts.find(p => p.slug === slug)
        if (!current) {
          notFound()
          return
        }

        setPost(current)
        setRelatedPosts(
          posts.filter(p => p.category === current.category && p.id !== current.id).slice(0, 3)
        )
      } catch (err) {
        console.error('Error fetching blog post:', err)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden pt-20">
        <section className="py-24 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
              Loading Post...
            </h1>
          </div>
        </section>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-96 bg-slate-200 rounded-xl mb-8" />
            <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-4" />
            <div className="h-4 bg-slate-200 rounded-lg w-full mb-2" />
            <div className="h-4 bg-slate-200 rounded-lg w-5/6 mb-2" />
            <div className="h-4 bg-slate-200 rounded-lg w-4/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) notFound()

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      {/* Header with Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 md:h-[500px] bg-slate-900 overflow-hidden group"
      >
        {post!.image && (
          <img
            src={post!.image}
            alt={post!.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent" />

        <div className="absolute top-8 left-4 md:left-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white hover:text-primary font-bold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Blog
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white"
        >
          <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
            post!.category === 'cleaning-tips' ? 'bg-blue-500' :
            post!.category === 'industry-news' ? 'bg-purple-500' :
            post!.category === 'customer-stories' ? 'bg-green-500' :
            post!.category === 'how-to' ? 'bg-orange-500' :
            'bg-pink-500'
          }`}>
            {post!.category.replace(/-/g, ' ')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight max-w-4xl">
            {post!.title}
          </h1>
        </motion.div>
      </motion.div>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {/* Author Info */}
              <div className="flex items-center gap-4 pb-8 border-b-2 border-slate-200 mb-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{post!.author}</h3>
                  <p className="text-sm text-slate-500">
                    {new Date(post!.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} • {post!.readTime} min read
                  </p>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {post!.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter(item => item.startsWith('- '))
                    return (
                      <ul key={i} className="list-disc list-inside space-y-2 my-6 text-slate-700">
                        {items.map((item, j) => (
                          <li key={j} className="font-medium">{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    )
                  }
                  if (paragraph.match(/^\d+\./)) {
                    return (
                      <ol key={i} className="list-decimal list-inside space-y-2 my-6 text-slate-700">
                        {paragraph.split('\n').filter(l => l.trim()).map((line, j) => (
                          <li key={j} className="font-medium">{line.replace(/^\d+\.\s/, '')}</li>
                        ))}
                      </ol>
                    )
                  }
                  if (paragraph.match(/^#{1,3}\s/)) {
                    const level = paragraph.match(/^#+/)?.[0].length || 1
                    const text = paragraph.replace(/^#+\s/, '')
                    const cls = level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'
                    return (
                      <h2 key={i} className={`${cls} font-black text-slate-900 mt-8 mb-4`}>{text}</h2>
                    )
                  }
                  return (
                    <p key={i} className="text-slate-700 font-medium leading-relaxed text-lg mb-6">
                      {paragraph}
                    </p>
                  )
                })}
              </div>

              {/* Share */}
              <div className="mt-12 pt-8 border-t-2 border-slate-200 flex items-center gap-4">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Share:</span>
                <button
                  onClick={() => navigator.share?.({ title: post!.title, url: window.location.href })}
                  className="p-3 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
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
                            alt={related.title}
                            className="h-16 w-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{related.readTime} min read</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors mt-1 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
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

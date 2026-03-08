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
  promotionalImages?: string[]
  ctaImage?: string
}

function toSlug(title: string, id: string) {
  return title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${id}`
}

function splitContentAtH2(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim())
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

function renderParagraph(paragraph: string, index: number) {
  if (paragraph.startsWith('- ')) {
    const items = paragraph.split('\n').filter(item => item.startsWith('- '))
    return (
      <ul key={index} className="list-disc list-inside space-y-2 my-6 text-slate-700">
        {items.map((item, j) => (
          <li key={j} className="font-medium">{item.replace('- ', '')}</li>
        ))}
      </ul>
    )
  }
  if (paragraph.match(/^\d+\./)) {
    return (
      <ol key={index} className="list-decimal list-inside space-y-2 my-6 text-slate-700">
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
    return <h2 key={index} className={`${cls} font-black text-slate-900 mt-8 mb-4`}>{text}</h2>
  }
  return (
    <p key={index} className="text-slate-700 font-medium leading-relaxed text-lg mb-6">
      {paragraph}
    </p>
  )
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
            promotionalImages: d.promotionalImages || [],
            ctaImage: d.ctaImage || '',
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

  const { p1, h2, p2 } = splitContentAtH2(post!.content)
  const promoImages = post!.promotionalImages || []
  const ctaImage = post!.ctaImage || ''

  const categoryColor =
    post!.category === 'cleaning-tips' ? 'bg-blue-500 text-white' :
    post!.category === 'industry-news' ? 'bg-purple-500 text-white' :
    post!.category === 'customer-stories' ? 'bg-green-500 text-white' :
    post!.category === 'how-to' ? 'bg-orange-500 text-white' :
    'bg-pink-500 text-white'

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Slim Hero — Title & Meta */}
      <section className="py-16 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold transition-colors mb-8"
              >
                <ArrowLeft className="h-5 w-5" /> Back to Blog
              </Link>
              <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${categoryColor}`}>
                {post!.category.replace(/-/g, ' ')}
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-8">
                {post!.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post!.author}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post!.readTime} min read</span>
                </div>
                <span>•</span>
                <span>
                  {new Date(post!.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Article + Sidebar */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Article */}
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {/* Featured Image */}
              {post!.image && (
                <div className="w-full rounded-2xl overflow-hidden mb-10 aspect-video">
                  <img
                    src={post!.image}
                    alt={post!.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* P1 — intro paragraphs before first H2 */}
              <div className="prose prose-lg max-w-none mb-10">
                {p1.map((paragraph, i) => renderParagraph(paragraph, i))}
              </div>

              {/* Promotional Images (2 side by side) */}
              {promoImages.length > 0 && (
                <div className={`grid gap-4 mb-10 ${promoImages.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {promoImages.slice(0, 2).map((src, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden aspect-video">
                      <img
                        src={src}
                        alt={`Promotional image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* H2 Section Heading */}
              {h2 && (
                <h2 className="text-3xl font-black text-slate-900 mt-4 mb-8 pb-4 border-b-2 border-primary/20">
                  {h2}
                </h2>
              )}

              {/* CTA Image */}
              {ctaImage && (
                <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-xl">
                  <img
                    src={ctaImage}
                    alt="Call to action"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* P2 — remaining content */}
              <div className="prose prose-lg max-w-none">
                {p2.map((paragraph, i) => renderParagraph(paragraph, i + p1.length + 1))}
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

'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Clock, User, Share2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { INITIAL_BLOG_POSTS } from '@/lib/blog-data'
import { notFound } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

// Firebase blog post type
type FirebaseBlogPost = {
  id: string;
  title: string;
  name: string;
  description: string;
  content: string;
  readTime: number;
  imageURL: string;
  featured: boolean;
  tags: string[];
  createdAt: any;
  slug?: string;
  excerpt?: string;
  author?: string;
  category?: string;
  publishedAt?: string;
  image?: string;
}

// Combined blog post type
type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: number;
  author: string;
  publishedAt: string;
  featured: boolean;
  authorImage?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [allFirebasePosts, setAllFirebasePosts] = useState<FirebaseBlogPost[]>([])

  // Fetch all Firebase posts
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        // Fetch all Firebase posts
        const querySnapshot = await getDocs(collection(db, 'blog-post'))
        const firebasePosts: FirebaseBlogPost[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          const firebasePost: FirebaseBlogPost = {
            id: doc.id,
            title: data.title || '',
            name: data.name || 'Admin',
            description: data.description || '',
            content: data.content || '',
            readTime: data.readTime || 5,
            imageURL: data.imageURL || '',
            featured: data.featured || false,
            tags: data.tags || [],
            createdAt: data.createdAt,
            slug: data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${doc.id}`,
            excerpt: data.description?.substring(0, 100) + '...' || '',
            author: data.name || 'Admin',
            category: data.tags?.[0]?.toLowerCase()?.replace(/\s+/g, '-') || 'how-to',
            publishedAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            image: data.imageURL || '/api/placeholder/600/400'
          }
          firebasePosts.push(firebasePost)
        })
        
        setAllFirebasePosts(firebasePosts)

        // Convert Firebase posts to match the format of INITIAL_BLOG_POSTS
        const convertedFirebasePosts: BlogPost[] = firebasePosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug || `post-${post.id}`,
          excerpt: post.excerpt || post.description?.substring(0, 100) + '...' || 'No description available',
          content: post.content,
          image: post.image || '/api/placeholder/600/400',
          category: post.category || 'how-to',
          readTime: post.readTime || 5,
          author: post.author || 'Admin',
          publishedAt: post.publishedAt || new Date().toISOString(),
          featured: post.featured || false,
          authorImage: undefined // Firebase posts don't have author image yet
        }))

        // Combine Firebase posts with dummy posts
        const allPosts: BlogPost[] = [...convertedFirebasePosts, ...INITIAL_BLOG_POSTS]

        // Find the current post by slug
        const currentPost = allPosts.find(p => p.slug === slug)
        
        if (!currentPost) {
          notFound()
          return
        }

        setPost(currentPost)

        // Find related posts (same category, excluding current post)
        const related = allPosts
          .filter(p => p.category === currentPost.category && p.id !== currentPost.id)
          .slice(0, 3)
        
        setRelatedPosts(related)

      } catch (error) {
        console.error('Error fetching blog post:', error)
        // Fallback to dummy posts if Firebase fails
        const dummyPost = INITIAL_BLOG_POSTS.find(p => p.slug === slug)
        if (dummyPost) {
          setPost(dummyPost)
          const related = INITIAL_BLOG_POSTS
            .filter(p => p.category === dummyPost.category && p.id !== dummyPost.id)
            .slice(0, 3)
          setRelatedPosts(related)
        } else {
          notFound()
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAllPosts()
  }, [slug])

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden pt-20">
        <section className="py-24 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
                Loading Post...
              </h1>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-96 bg-slate-200 rounded-xl mb-8"></div>
            <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-5/6 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      {/* Header with Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 md:h-125 bg-slate-900 overflow-hidden group"
      >
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent" />

        <div className="absolute top-8 left-4 md:left-0">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-white hover:text-primary font-bold transition-colors ml-4 md:ml-0"
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
            post.category === 'cleaning-tips' ? 'bg-blue-500' :
            post.category === 'industry-news' ? 'bg-purple-500' :
            post.category === 'customer-stories' ? 'bg-green-500' :
            post.category === 'how-to' ? 'bg-orange-500' :
            'bg-pink-500'
          }`}>
            {post.category.replace('-', ' ')}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight max-w-4xl">
            {post.title}
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
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  {post.authorImage ? (
                    <img src={post.authorImage} alt={post.author} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{post.author}</h3>
                  <p className="text-sm text-slate-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} • {post.readTime} min read
                  </p>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {post.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter(item => item.startsWith('- '))
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
                  
                  if (paragraph.match(/^\d+\./)) {
                    const lines = paragraph.split('\n').filter(line => line.trim())
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

                  if (paragraph.match(/^#{1,3}\s/)) {
                    const level = paragraph.match(/^#+/)?.[0].length || 1
                    const text = paragraph.replace(/^#+\s/, '')
                    const headingClass = level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'
                    return (
                      <h2 key={i} className={`${headingClass} font-black text-slate-900 mt-8 mb-4`}>
                        {text}
                      </h2>
                    )
                  }

                  return (
                    <p key={i} className="text-slate-700 font-medium leading-relaxed text-lg mb-6">
                      {paragraph}
                    </p>
                  )
                })}
              </div>

              {/* Share & Actions */}
              <div className="mt-12 pt-8 border-t-2 border-slate-200 flex items-center gap-4">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Share:</span>
                <button className="p-3 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all">
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
              {/* CTA Box */}
              <div className="bg-primary/10 border-2 border-primary rounded-2xl p-8 sticky top-24 mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-3">Need Professional Cleaning?</h3>
                <p className="text-sm text-slate-700 mb-6">Our expert team can help keep your space clean and healthy.</p>
                <Link 
                  href="/book-service"
                  className="block w-full bg-primary text-white px-6 py-4 rounded-xl font-black text-center hover:bg-pink-600 transition-colors mb-3"
                >
                  Book Now
                </Link>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-8">
                  <h3 className="text-lg font-black text-slate-900 mb-6">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map(relatedPost => (
                      <Link
                        key={relatedPost.id}
                        href={`/${relatedPost.slug}`}
                        className="group flex items-start gap-3 p-4 rounded-lg hover:bg-white transition-colors"
                      >
                        <img 
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="h-16 w-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{relatedPost.readTime} min read</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors mt-1" />
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
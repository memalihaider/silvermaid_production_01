
'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Clock, User, Zap } from 'lucide-react'
import Link from 'next/link'
import { INITIAL_BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/blog-data'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const POSTS_PER_PAGE = 6

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

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [firebasePosts, setFirebasePosts] = useState<FirebaseBlogPost[]>([])

  // Fetch posts from Firebase
  useEffect(() => {
    const fetchFirebasePosts = async () => {
      try {
        const q = query(collection(db, 'blog-post'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        
        const posts: FirebaseBlogPost[] = []
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
            // Map first tag to category or use default
            category: data.tags?.[0]?.toLowerCase()?.replace(/\s+/g, '-') || 'how-to',
            publishedAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            image: data.imageURL || '/api/placeholder/600/400'
          }
          posts.push(firebasePost)
        })
        
        setFirebasePosts(posts)
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      }
    }

    fetchFirebasePosts()
  }, [])

  // Combine dummy posts and Firebase posts
  const allPosts = useMemo(() => {
    // Convert Firebase posts to match the format of INITIAL_BLOG_POSTS
    const convertedFirebasePosts = firebasePosts.map(post => ({
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
      featured: post.featured || false
    }))

    // Return combined array (Firebase posts first, then dummy posts)
    return [...convertedFirebasePosts, ...INITIAL_BLOG_POSTS]
  }, [firebasePosts])

  const filteredPosts = useMemo(() => {
    return allPosts
      .filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(post => !selectedCategory || post.category === selectedCategory)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }, [allPosts, searchTerm, selectedCategory])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  // Get featured posts (from Firebase first, then dummy)
  const featuredPosts = useMemo(() => {
    const firebaseFeatured = firebasePosts
      .filter(p => p.featured)
      .map(post => ({
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
        featured: true
      }))
    
    // If we don't have enough featured posts from Firebase, add from dummy
    if (firebaseFeatured.length < 2) {
      const dummyFeatured = INITIAL_BLOG_POSTS
        .filter(p => p.featured)
        .slice(0, 2 - firebaseFeatured.length)
      return [...firebaseFeatured, ...dummyFeatured]
    }
    
    return firebaseFeatured.slice(0, 2)
  }, [firebasePosts])

  return (
    <div className="flex flex-col overflow-hidden pt-20">
      {/* Hero Section - Same as before */}
      <section className="py-24 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
              Cleaning <span className="text-primary italic">Insights</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium mb-8">
              Expert tips, industry news, and cleaning guides to keep your spaces pristine.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts - Now includes Firebase posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white border-b-4 border-primary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
                Featured
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                <Zap className="inline h-8 w-8 text-primary mr-3 align-text-top" />
                Must Read
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-slate-200"
                >
                  <Link href={`/${post.slug}`} className="flex flex-col h-full">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="p-8 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            post.category === 'cleaning-tips' ? 'bg-blue-100 text-blue-700' :
                            post.category === 'industry-news' ? 'bg-purple-100 text-purple-700' :
                            post.category === 'customer-stories' ? 'bg-green-100 text-green-700' :
                            post.category === 'how-to' ? 'bg-orange-100 text-orange-700' :
                            'bg-pink-100 text-pink-700'
                          }`}>
                            {post.category.replace(/-/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">⭐ Featured</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 font-medium leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {post.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" /> {post.author}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter - Same UI */}
      <section className="py-12 bg-slate-50 border-b-2 border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-primary outline-none transition-colors text-slate-900 placeholder-slate-500"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setCurrentPage(1)
                }}
                className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === null 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-primary'
                }`}
              >
                All
              </button>
              {BLOG_CATEGORIES.map(cat => (
                <div key={cat.id} className="flex gap-1">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.slug as any)
                      setCurrentPage(1)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-primary'
                    }`}
                  >
                    {cat.name}
                  </button>
                  <Link
                    href={`/blog/category/${cat.slug}`}
                    className="flex items-center justify-center px-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:border-primary hover:text-primary transition-all text-xs"
                    title={`Browse all ${cat.name}`}
                  >
                    →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid - Now shows combined posts */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {paginatedPosts.length > 0 ? (
            <>
              {/* Show Firebase posts indicator if available */}
              {firebasePosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                    📝 Latest from Blog
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Showing {firebasePosts.length} real blog post{firebasePosts.length !== 1 ? 's' : ''} from Firebase + {INITIAL_BLOG_POSTS.length} sample posts
                  </p>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 border-slate-200 flex flex-col"
                  >
                    <Link href={`/${post.slug}`} className="flex flex-col h-full">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            post.category === 'cleaning-tips' ? 'bg-blue-100 text-blue-700' :
                            post.category === 'industry-news' ? 'bg-purple-100 text-purple-700' :
                            post.category === 'customer-stories' ? 'bg-green-100 text-green-700' :
                            post.category === 'how-to' ? 'bg-orange-100 text-orange-700' :
                            'bg-pink-100 text-pink-700'
                          }`}>
                            {post.category.replace(/-/g, ' ')}
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
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Pagination - Same UI */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex justify-center items-center gap-4"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2 rounded-xl border-2 border-slate-200 font-bold uppercase tracking-wider hover:border-primary disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-slate-600 font-medium">No articles found matching your search.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory(null)
                  setCurrentPage(1)
                }}
                className="mt-4 px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-pink-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
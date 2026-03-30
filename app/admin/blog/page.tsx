'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, ChevronDown } from 'lucide-react'
import { INITIAL_BLOG_POSTS } from '@/lib/blog-data'
import Link from 'next/link'

const decodeMaybeUrlEncoded = (value: string) => {
  if (!value) return value
  if (!/%[0-9A-Fa-f]{2}/.test(value)) return value
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const sanitizeInlineHtml = (value: string) =>
  value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')

export default function AdminBlogPage() {
  const [posts, setPosts] = useState(INITIAL_BLOG_POSTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest')

  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(post => !categoryFilter || post.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      if (sortBy === 'oldest') return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      return b.views - a.views
    })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Blog Management</h1>
              <p className="text-slate-600 font-medium">Manage all your blog posts in one place</p>
            </div>
            <Link 
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 bg-primary px-8 py-4 rounded-2xl font-black text-white hover:bg-pink-600 transition-colors"
            >
              <Plus className="h-5 w-5" /> New Post
            </Link>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            <select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-primary outline-none font-medium"
            >
              <option value="">All Categories</option>
              <option value="cleaning-tips">Cleaning Tips</option>
              <option value="industry-news">Industry News</option>
              <option value="customer-stories">Customer Stories</option>
              <option value="how-to">How-To Guides</option>
              <option value="seasonal">Seasonal</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-primary outline-none font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </motion.div>

        {/* Posts Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-4xl shadow-xl overflow-hidden border border-slate-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-black text-sm uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-left font-black text-sm uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left font-black text-sm uppercase tracking-widest">Published</th>
                  <th className="px-6 py-4 text-left font-black text-sm uppercase tracking-widest">Views</th>
                  <th className="px-6 py-4 text-left font-black text-sm uppercase tracking-widest">Featured</th>
                  <th className="px-6 py-4 text-center font-black text-sm uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, index) => (
                  <tr 
                    key={post.id}
                    className={`border-t border-slate-200 hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div
                        className="font-bold text-slate-900 text-sm truncate max-w-xs"
                        dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(decodeMaybeUrlEncoded(post.title)) }}
                      />
                      <div className="text-xs text-slate-500 mt-1">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        post.category === 'cleaning-tips' ? 'bg-blue-100 text-blue-700' :
                        post.category === 'industry-news' ? 'bg-purple-100 text-purple-700' :
                        post.category === 'customer-stories' ? 'bg-green-100 text-green-700' :
                        post.category === 'how-to' ? 'bg-orange-100 text-orange-700' :
                        'bg-pink-100 text-pink-700'
                      }`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{post.views.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        post.featured ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {post.featured ? '⭐ Featured' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-3">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-600 font-medium text-lg">No posts found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or create a new post</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mt-12"
        >
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
            <div className="text-4xl font-black text-primary mb-2">{posts.length}</div>
            <div className="text-slate-600 font-bold">Total Posts</div>
          </div>
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
            <div className="text-4xl font-black text-green-600 mb-2">{posts.filter(p => p.featured).length}</div>
            <div className="text-slate-600 font-bold">Featured Posts</div>
          </div>
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
            <div className="text-4xl font-black text-purple-600 mb-2">{posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</div>
            <div className="text-slate-600 font-bold">Total Views</div>
          </div>
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
            <div className="text-4xl font-black text-orange-600 mb-2">{new Set(posts.map(p => p.category)).size}</div>
            <div className="text-slate-600 font-bold">Categories</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

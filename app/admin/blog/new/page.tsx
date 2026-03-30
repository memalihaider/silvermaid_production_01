'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BlogPost } from '@/lib/types/blog'
import { db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

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

export default function NewBlogPostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    seoTitle: '',
    excerpt: '',
    content: '',
    p1: '',
    h2: '',
    p2: '',
    author: '',
    authorImage: '',
    category: 'cleaning-tips',
    image: 'https://images.unsplash.com/photo-1559688169-64efad69fbc1?auto=format&fit=crop&q=80&w=800',
    featured: false,
    readTime: 5,
    canonicalUrl: '',
    tags: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const normalizeTag = (value: string) => value.trim().replace(/^#/, '')

  const handleAddTag = (value: string) => {
    const tag = normalizeTag(value)
    if (!tag) return

    setFormData(prev => {
      const tags = prev.tags || []
      const exists = tags.some(t => t.toLowerCase() === tag.toLowerCase())
      return exists ? prev : { ...prev, tags: [...tags, tag] }
    })
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(tagInput)
      return
    }

    if (e.key === 'Backspace' && !tagInput) {
      setFormData(prev => ({ ...prev, tags: (prev.tags || []).slice(0, -1) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const structuredContent = [
        formData.p1?.trim(),
        formData.h2?.trim() ? `## ${formData.h2.trim()}` : '',
        formData.p2?.trim(),
      ]
        .filter(Boolean)
        .join('\n\n')

      const contentValue = formData.content?.trim() ? formData.content : structuredContent

      const payload = {
        title: formData.title?.trim() || '',
        name: formData.author?.trim() || 'Admin',
        description: formData.excerpt?.trim() || '',
        seoTitle: formData.seoTitle?.trim() || '',
        canonicalUrl: formData.canonicalUrl?.trim() || '',
        content: contentValue || '',
        p1: formData.p1?.trim() || '',
        h2: formData.h2?.trim() || '',
        p2: formData.p2?.trim() || '',
        readTime: Number(formData.readTime) || 5,
        imageURL: formData.image || '',
        featured: !!formData.featured,
        category: formData.category || '',
        tags: formData.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, 'blog-post'), payload)
      alert('Blog post created successfully!')
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error creating blog post:', error)
      alert('Error creating blog post!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const slug = generateSlug(formData.title || 'untitled')

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-pink-600 font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Blog
          </Link>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Create New Blog Post</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6"
          >
            {/* Title */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Post Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors text-lg font-bold"
              />
              <p className="text-xs text-slate-500 mt-2">Slug: {slug}</p>
            </div>

            {/* SEO Title */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">SEO Title</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                placeholder="Custom title for Google SERP (optional)"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Meta Description */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Meta Description (SERP) *</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Shown in Google search results"
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">{formData.excerpt?.length || 0}/300 characters</p>
            </div>

            {/* Canonical URL */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Canonical URL</label>
              <input
                type="url"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                placeholder="https://www.silvermaidsdubai.com/your-post"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Content */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Full blog post content. Supports markdown formatting."
                required
                rows={15}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors resize-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">{formData.content?.length || 0} characters</p>
            </div>

            {/* Structured Content */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 space-y-5">
              <div>
                <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Paragraph 1 (P1)</label>
                <textarea
                  name="p1"
                  value={formData.p1}
                  onChange={handleInputChange}
                  placeholder="Opening paragraph(s)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Section Heading (H2)</label>
                <input
                  type="text"
                  name="h2"
                  value={formData.h2}
                  onChange={handleInputChange}
                  placeholder="Optional section heading"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Paragraph 2 (P2)</label>
                <textarea
                  name="p2"
                  value={formData.p2}
                  onChange={handleInputChange}
                  placeholder="Follow-up paragraph(s)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Category & Read Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
                <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors font-medium"
                >
                  <option value="cleaning-tips">Cleaning Tips</option>
                  <option value="industry-news">Industry News</option>
                  <option value="customer-stories">Customer Stories</option>
                  <option value="how-to">How-To Guides</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
                <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Read Time (minutes)</label>
                <input
                  type="number"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleInputChange}
                  min="1"
                  max="60"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Tags</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => handleAddTag(tagInput)}
                placeholder="Type a tag and press Enter"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
              />
              {(formData.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {(formData.tags || []).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: (prev.tags || []).filter(t => t !== tag)
                      }))}
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200"
                      title="Remove"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Author & Featured */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
                <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Author Name *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-6 w-6 accent-primary"
                  />
                  <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Featured Post</span>
                </label>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
              <label className="block font-black text-slate-900 mb-3 uppercase tracking-widest text-sm">Featured Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary px-8 py-5 rounded-2xl font-black text-white hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Save className="h-5 w-5" /> {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </motion.form>

          {/* Preview Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full mb-4 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors uppercase tracking-widest"
            >
              <Eye className="h-5 w-5" /> {showPreview ? 'Hide' : 'Show'} Preview
            </button>

            {showPreview && (
              <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden sticky top-24">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      formData.category === 'cleaning-tips' ? 'bg-blue-100 text-blue-700' :
                      formData.category === 'industry-news' ? 'bg-purple-100 text-purple-700' :
                      formData.category === 'customer-stories' ? 'bg-green-100 text-green-700' :
                      formData.category === 'how-to' ? 'bg-orange-100 text-orange-700' :
                      'bg-pink-100 text-pink-700'
                    }`}>
                      {formData.category}
                    </span>
                  </div>
                  <h3
                    className="font-black text-lg text-slate-900 mb-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(decodeMaybeUrlEncoded(formData.title || 'Post Title')) }}
                  />
                  <p
                    className="text-sm text-slate-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(decodeMaybeUrlEncoded(formData.excerpt || '')) }}
                  />
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>By {formData.author || 'Author Name'}</p>
                    <p>{formData.readTime} min read</p>
                    {formData.featured && <p className="text-yellow-600 font-bold">⭐ Featured</p>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

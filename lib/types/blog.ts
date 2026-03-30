export interface BlogPost {
  id: string
  title: string
  seoTitle?: string
  canonicalUrl?: string
  slug: string
  excerpt: string
  content: string
  p1?: string
  h2?: string
  p2?: string
  tags?: string[]
  author: string
  authorImage?: string
  category: 'cleaning-tips' | 'industry-news' | 'customer-stories' | 'how-to' | 'seasonal'
  image: string
  featured: boolean
  publishedAt: string
  updatedAt: string
  readTime: number
  views: number
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string
  color: string
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: '1', name: 'Cleaning Tips', slug: 'cleaning-tips', description: 'Expert cleaning advice and hacks', color: 'bg-blue-100' },
  { id: '2', name: 'Industry News', slug: 'industry-news', description: 'Latest news in the cleaning industry', color: 'bg-purple-100' },
  { id: '3', name: 'Customer Stories', slug: 'customer-stories', description: 'Success stories from our clients', color: 'bg-green-100' },
  { id: '4', name: 'How-To Guides', slug: 'how-to', description: 'Step-by-step cleaning guides', color: 'bg-orange-100' },
  { id: '5', name: 'Seasonal', slug: 'seasonal', description: 'Seasonal cleaning advice', color: 'bg-pink-100' }
]

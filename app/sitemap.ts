import type { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const SITE_URL = 'https://silvermaid-production-01.vercel.app'

function toSlug(title: string, id: string) {
  return title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${id}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/book-service`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/booking`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/quote`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Service pages
  const serviceRoutes: MetadataRoute.Sitemap = [
    'ac-coil-cleaning',
    'ac-duct-cleaning',
    'apartment-deep-cleaning',
    'balcony-deep-cleaning',
    'carpets-deep-cleaning',
    'deep-cleaning',
    'facade-cleaning',
    'filipino-cleaner',
    'floor-deep-cleaning',
    'furniture-cleaning',
    'garage-deep-cleaning',
    'grease-trap-cleaning',
    'grout-deep-cleaning',
    'gym-deep-cleaning',
    'home-cleaning',
    'kitchen-deep-cleaning',
    'kitchen-hood-cleaning',
    'maids-service',
    'mattress-deep-cleaning',
    'move-in-out-cleaning',
    'office-cleaning',
    'office-deep-cleaning',
    'part-time-cleaners',
    'post-construction-cleaning',
    'residential-cleaning',
    'restaurant-cleaning',
    'sofa-deep-cleaning',
    'swimming-pool-cleaning',
    'villa-deep-cleaning',
    'water-tank-cleaning',
    'window-cleaning',
  ].map(slug => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Blog posts from Firebase
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const q = query(collection(db, 'blog-post'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)

    blogRoutes = snap.docs.map(doc => {
      const data = doc.data()
      const slug = toSlug(data.title, doc.id)
      const lastMod = data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date()
      return {
        url: `${SITE_URL}/${slug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })
  } catch (error) {
    console.error('Sitemap: Error fetching blog posts:', error)
  }

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes]
}

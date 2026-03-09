import type { MetadataRoute } from 'next'

const SITE_URL = 'https://silvermaid-production-01.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/employee/',
          '/manager/',
          '/client/',
          '/guest/',
          '/login/',
          '/debug/',
          '/api/',
          '/route',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

import { NextResponse } from 'next/server'
import { adminDb, adminServerTimestamp } from '@/lib/firebase-admin'
import { verifyBasicAuth } from '@/lib/api-basic-auth'

type NewBlogPayload = {
  title: string
  description?: string
  content?: string
  p1?: string
  h2?: string
  p2?: string
  imageURL?: string
  category?: string
  tags?: string[] | string
  readTime?: number
  name?: string
  featured?: boolean | string | number
  promotionalImages?: string[]
  ctaImage?: string
}

function normalizeTags(tags: NewBlogPayload['tags']): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeFeatured(featured: NewBlogPayload['featured']): boolean {
  if (typeof featured === 'boolean') return featured
  if (typeof featured === 'number') return featured === 1
  if (typeof featured === 'string') {
    const value = featured.trim().toLowerCase()
    return value === '1' || value === 'true' || value === 'yes'
  }

  return false
}

async function parseRequestJson<T>(request: Request): Promise<T | null> {
  const raw = await request.text()
  if (!raw.trim()) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function toSlug(title: string, id: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${id}`
}

function timestampToISO(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('toDate' in value)) {
    return null
  }

  const toDate = (value as { toDate?: () => Date }).toDate
  if (typeof toDate !== 'function') return null
  return toDate().toISOString()
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function getNumber(value: unknown, fallback = 5): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export async function GET() {
  try {
    const snap = await adminDb.collection('blog-post').orderBy('createdAt', 'desc').get()

    const posts = snap.docs.map((docSnap: { id: string; data: () => Record<string, unknown> }) => {
      const data = docSnap.data()
      const title = getString(data.title)
      return {
        id: docSnap.id,
        title,
        slug: toSlug(title, docSnap.id),
        description: getString(data.description),
        content: getString(data.content),
        p1: getString(data.p1),
        h2: getString(data.h2),
        p2: getString(data.p2),
        imageURL: getString(data.imageURL),
        category: getString(data.category, 'general'),
        tags: getStringArray(data.tags),
        readTime: getNumber(data.readTime, 5),
        name: getString(data.name, 'Admin'),
        featured: !!data.featured,
        promotionalImages: getStringArray(data.promotionalImages),
        ctaImage: getString(data.ctaImage),
        createdAt: timestampToISO(data.createdAt),
        updatedAt: timestampToISO(data.updatedAt),
      }
    })

    return NextResponse.json({ success: true, data: posts })
  } catch (error) {
    console.error('GET /api/blog failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blog posts.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = verifyBasicAuth(request)
  if ('errorResponse' in authResult) return authResult.errorResponse

  const body = await parseRequestJson<NewBlogPayload>(request)
  if (!body) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const fallbackContent = [body.p1, body.p2]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .join('\n\n')

  const normalizedContent = body.content?.trim() || fallbackContent

  if (!body.title?.trim() || !normalizedContent) {
    return NextResponse.json(
      { success: false, error: 'title and content are required. Provide content or at least one paragraph field (p1/p2).' },
      { status: 400 }
    )
  }

  try {
    const payload = {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      content: normalizedContent,
      p1: body.p1?.trim() || '',
      h2: body.h2?.trim() || '',
      p2: body.p2?.trim() || '',
      imageURL: body.imageURL?.trim() || '',
      category: body.category?.trim() || 'general',
      tags: normalizeTags(body.tags),
      readTime: Number.isFinite(body.readTime) ? Number(body.readTime) : 5,
      name: body.name?.trim() || authResult.username,
      featured: normalizeFeatured(body.featured),
      promotionalImages: Array.isArray(body.promotionalImages)
        ? body.promotionalImages.map((image) => image.trim()).filter(Boolean)
        : [],
      ctaImage: body.ctaImage?.trim() || '',
      createdAt: adminServerTimestamp(),
      updatedAt: adminServerTimestamp(),
    }

    const ref = await adminDb.collection('blog-post').add(payload)

    const serializablePayload = {
      ...payload,
      createdAt: null,
      updatedAt: null,
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ref.id,
          slug: toSlug(serializablePayload.title, ref.id),
          ...serializablePayload,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/blog failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to create blog post.' }, { status: 500 })
  }
}

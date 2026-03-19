import { NextResponse } from 'next/server'
import { adminDb, adminServerTimestamp } from '@/lib/firebase-admin'
import { verifyBasicAuth } from '@/lib/api-basic-auth'

type UpdateBlogPayload = {
  title?: string
  description?: string
  content?: string
  p1?: string
  h2?: string
  p2?: string
  imageURL?: string
  category?: string
  tags?: string[]
  readTime?: number
  name?: string
  featured?: boolean
  promotionalImages?: string[]
  ctaImage?: string
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const blogRef = adminDb.collection('blog-post').doc(id)
    const snapshot = await blogRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    const data = snapshot.data() ?? {}
    const title = getString(data.title)
    return NextResponse.json({
      success: true,
      data: {
        id: snapshot.id,
        title,
        slug: toSlug(title, snapshot.id),
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
        createdAt: timestampToISO(data?.createdAt),
        updatedAt: timestampToISO(data?.updatedAt),
      },
    })
  } catch (error) {
    console.error('GET /api/blog/[id] failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch blog post.' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = verifyBasicAuth(request)
  if ('errorResponse' in authResult) return authResult.errorResponse

  const { id } = await context.params

  let body: UpdateBlogPayload
  try {
    body = (await request.json()) as UpdateBlogPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (typeof body.title === 'string') updates.title = body.title.trim()
  if (typeof body.description === 'string') updates.description = body.description.trim()
  if (typeof body.content === 'string') updates.content = body.content
  if (typeof body.p1 === 'string') updates.p1 = body.p1
  if (typeof body.h2 === 'string') updates.h2 = body.h2
  if (typeof body.p2 === 'string') updates.p2 = body.p2
  if (typeof body.imageURL === 'string') updates.imageURL = body.imageURL
  if (typeof body.category === 'string') updates.category = body.category
  if (Array.isArray(body.tags)) updates.tags = body.tags
  if (typeof body.readTime !== 'undefined') {
    const parsed = Number(body.readTime)
    if (!Number.isFinite(parsed) || parsed < 1) {
      return NextResponse.json({ success: false, error: 'readTime must be a positive number.' }, { status: 400 })
    }
    updates.readTime = parsed
  }
  if (typeof body.name === 'string') updates.name = body.name.trim()
  if (typeof body.featured !== 'undefined') updates.featured = !!body.featured
  if (Array.isArray(body.promotionalImages)) updates.promotionalImages = body.promotionalImages
  if (typeof body.ctaImage === 'string') updates.ctaImage = body.ctaImage

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'No valid fields to update.' }, { status: 400 })
  }

  updates.updatedAt = adminServerTimestamp()

  try {
    const blogRef = adminDb.collection('blog-post').doc(id)
    const existing = await blogRef.get()

    if (!existing.exists) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    await blogRef.update(updates)

    const responseUpdates = {
      ...updates,
      updatedAt: null,
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        ...responseUpdates,
      },
    })
  } catch (error) {
    console.error('PUT /api/blog/[id] failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to update blog post.' }, { status: 500 })
  }
}

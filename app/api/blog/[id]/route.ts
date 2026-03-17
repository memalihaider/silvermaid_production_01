import { NextResponse } from 'next/server'
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const blogRef = doc(db, 'blog-post', id)
    const snapshot = await getDoc(blogRef)

    if (!snapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    const data = snapshot.data()
    return NextResponse.json({
      success: true,
      data: {
        id: snapshot.id,
        title: data.title || '',
        slug: toSlug(data.title || '', snapshot.id),
        description: data.description || '',
        content: data.content || '',
        p1: data.p1 || '',
        h2: data.h2 || '',
        p2: data.p2 || '',
        imageURL: data.imageURL || '',
        category: data.category || 'general',
        tags: Array.isArray(data.tags) ? data.tags : [],
        readTime: data.readTime || 5,
        name: data.name || 'Admin',
        featured: !!data.featured,
        promotionalImages: Array.isArray(data.promotionalImages) ? data.promotionalImages : [],
        ctaImage: data.ctaImage || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
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

  updates.updatedAt = serverTimestamp()

  try {
    const blogRef = doc(db, 'blog-post', id)
    const existing = await getDoc(blogRef)

    if (!existing.exists()) {
      return NextResponse.json({ success: false, error: 'Blog post not found.' }, { status: 404 })
    }

    await updateDoc(blogRef, updates)

    return NextResponse.json({
      success: true,
      data: {
        id,
        ...updates,
      },
    })
  } catch (error) {
    console.error('PUT /api/blog/[id] failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to update blog post.' }, { status: 500 })
  }
}

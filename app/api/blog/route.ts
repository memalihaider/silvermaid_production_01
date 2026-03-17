import { NextResponse } from 'next/server'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { verifyBasicAuth } from '@/lib/api-basic-auth'

type NewBlogPayload = {
  title: string
  description?: string
  content: string
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

export async function GET() {
  try {
    const q = query(collection(db, 'blog-post'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)

    const posts = snap.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        title: data.title || '',
        slug: toSlug(data.title || '', docSnap.id),
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

  let body: NewBlogPayload
  try {
    body = (await request.json()) as NewBlogPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json(
      { success: false, error: 'Both title and content are required.' },
      { status: 400 }
    )
  }

  try {
    const payload = {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      content: body.content.trim(),
      p1: body.p1 || '',
      h2: body.h2 || '',
      p2: body.p2 || '',
      imageURL: body.imageURL || '',
      category: body.category || 'general',
      tags: Array.isArray(body.tags) ? body.tags : [],
      readTime: Number.isFinite(body.readTime) ? Number(body.readTime) : 5,
      name: body.name?.trim() || authResult.username,
      featured: !!body.featured,
      promotionalImages: Array.isArray(body.promotionalImages) ? body.promotionalImages : [],
      ctaImage: body.ctaImage || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const ref = await addDoc(collection(db, 'blog-post'), payload)

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ref.id,
          slug: toSlug(payload.title, ref.id),
          ...payload,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/blog failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to create blog post.' }, { status: 500 })
  }
}

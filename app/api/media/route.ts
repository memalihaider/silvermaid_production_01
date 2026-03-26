import { NextResponse } from 'next/server'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { verifyBasicAuth } from '@/lib/api-basic-auth'

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function getFilenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) return ''
  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1])
  const simpleMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  return simpleMatch?.[1] || ''
}

export async function POST(request: Request) {
  const authResult = verifyBasicAuth(request)
  if ('errorResponse' in authResult) return authResult.errorResponse

  const requestContentType = request.headers.get('content-type') || 'application/octet-stream'

  try {
    let bytes: Uint8Array
    let fileName = ''

    let uploadContentType = requestContentType

    if (requestContentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const candidateFields = ['file', 'data', 'image', 'media', 'upload']
      let file: File | null = null

      for (const field of candidateFields) {
        const value = form.get(field)
        if (value instanceof File) {
          file = value
          break
        }
      }

      if (!file) {
        for (const value of form.values()) {
          if (value instanceof File) {
            file = value
            break
          }
        }
      }

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'Expected a multipart file field (file, data, image, media, upload).',
          },
          { status: 400 }
        )
      }

      fileName = file.name || ''
      bytes = new Uint8Array(await file.arrayBuffer())
      uploadContentType = file.type || uploadContentType
    } else {
      const headerFileName = request.headers.get('x-file-name')
      const cdFileName = getFilenameFromContentDisposition(request.headers.get('content-disposition'))
      fileName = headerFileName || cdFileName || ''

      const raw = await request.arrayBuffer()
      if (!raw.byteLength) {
        return NextResponse.json(
          { success: false, error: 'Binary request body is empty.' },
          { status: 400 }
        )
      }
      bytes = new Uint8Array(raw)
    }

    const finalName = sanitizeFilename(fileName || `upload-${Date.now()}.bin`)
    const storagePath = `blog-media/${Date.now()}-${finalName}`
    const storageRef = ref(storage, storagePath)

    const snapshot = await uploadBytes(storageRef, bytes, {
      contentType: uploadContentType,
      customMetadata: {
        uploadedBy: authResult.username,
      },
    })

    const imageUrl = await getDownloadURL(snapshot.ref)

    return NextResponse.json(
      {
        success: true,
        data: {
          url: imageUrl,
          path: storagePath,
          contentType: uploadContentType,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/media failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload media.' }, { status: 500 })
  }
}

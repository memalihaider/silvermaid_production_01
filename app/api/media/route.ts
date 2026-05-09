/**
 * Media upload endpoint (multipart or raw body).
 *
 * If clients see **413 Request Entity Too Large** with `nginx/...` in the body,
 * the reverse proxy limit must be raised — see `deploy/nginx-client-max-body.conf`.
 */
import { NextResponse } from 'next/server'
import { verifyBasicAuth } from '@/lib/api-basic-auth'
import { adminApp, getAdminStorageBucketCandidates } from '@/lib/firebase-admin'
import { getStorage as getAdminStorage } from 'firebase-admin/storage'

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

function getMediaApiErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error ?? '')

  if (/Could not load the default credentials/i.test(message)) {
    return 'Firebase Admin SDK failed to initialize. On your hosting provider (e.g., Vercel), set FIREBASE_SERVICE_ACCOUNT_JSON or all three of: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. See FIREBASE_ENV_SETUP.md for details.'
  }

  if (/bucket.*not exist|No such bucket|The specified bucket does not exist/i.test(message)) {
    return 'Firebase Storage bucket not found. Set FIREBASE_STORAGE_BUCKET=silvermaid-94246.appspot.com and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=silvermaid-94246.appspot.com in your hosting environment. See FIREBASE_ENV_SETUP.md for full setup.'
  }

  if (/PERMISSION_DENIED|insufficient permissions|Missing or insufficient permissions|unauthorized/i.test(message)) {
    return 'Firebase Storage permission denied. Verify the service account has Editor role in your Firebase project and was created before the app was deployed.'
  }

  if (/deadline exceeded|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|network/i.test(message)) {
    return 'Network error reaching Firebase. This is usually transient; check your hosting logs. If persistent, verify firewall rules allow access to firebasestorage.googleapis.com.'
  }

  return fallback
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
            error:
              'Expected a multipart file field (file, data, image, media, upload). In n8n, set Input Data Field Name to your binary property (for example: data) and make sure the request uses multipart/form-data.',
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
    const downloadToken = crypto.randomUUID()

    let lastError: unknown
    const fallbackBucket = getAdminStorage(adminApp).bucket()
    const bucketNames = [...getAdminStorageBucketCandidates(), fallbackBucket.name].filter(Boolean)

    console.debug('POST /api/media: Attempting upload', {
      uploadedBy: authResult.username,
      storagePath,
      bucketCandidates: bucketNames,
      primaryBucket: bucketNames[0] || 'undefined',
    })

    for (const bucketName of bucketNames) {
      const bucket = bucketName ? getAdminStorage(adminApp).bucket(bucketName) : fallbackBucket
      const object = bucket.file(storagePath)

      try {
        await object.save(Buffer.from(bytes), {
          contentType: uploadContentType,
          resumable: false,
          metadata: {
            metadata: {
              uploadedBy: authResult.username,
              firebaseStorageDownloadTokens: downloadToken,
            },
          },
        })

        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`

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
        lastError = error
        const message = error instanceof Error ? error.message : String(error ?? '')

        if (!/bucket.*not exist|No such bucket|The specified bucket does not exist/i.test(message)) {
          throw error
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to resolve a valid Firebase Storage bucket.')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('POST /api/media failed:', {
      message: errorMessage,
      stack: errorStack,
    })
    return NextResponse.json(
      {
        success: false,
        error: getMediaApiErrorMessage(error, 'Failed to upload media.'),
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

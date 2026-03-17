import { NextResponse } from 'next/server'

export type BasicAuthResult = {
  username: string
} | {
  errorResponse: NextResponse
}

export function verifyBasicAuth(request: Request): BasicAuthResult {
  const expectedUser = process.env.BLOG_API_USER
  const expectedPass = process.env.BLOG_API_PASSWORD

  if (!expectedUser || !expectedPass) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'API auth is not configured on server.' },
        { status: 500 }
      )
    }
  }

  const authHeader = request.headers.get('authorization') || ''
  if (!authHeader.startsWith('Basic ')) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Missing Basic Authorization header.' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Blog API"' }
        }
      )
    }
  }

  const encoded = authHeader.slice(6).trim()
  let decoded = ''

  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf-8')
  } catch {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid Authorization header encoding.' },
        { status: 401 }
      )
    }
  }

  const separatorIndex = decoded.indexOf(':')
  if (separatorIndex === -1) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid Authorization header format.' },
        { status: 401 }
      )
    }
  }

  const username = decoded.slice(0, separatorIndex)
  const password = decoded.slice(separatorIndex + 1)

  if (username !== expectedUser || password !== expectedPass) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      )
    }
  }

  return { username }
}

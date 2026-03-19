import { NextResponse } from 'next/server'

const USER_ENV_KEYS = [
  'BLOG_API_USER',
  'BLOG_API_USERNAME',
  'API_BASIC_AUTH_USER',
  'API_BASIC_AUTH_USERNAME',
  'BASIC_AUTH_USER',
  'BASIC_AUTH_USERNAME',
] as const

const PASS_ENV_KEYS = [
  'BLOG_API_PASSWORD',
  'BLOG_API_PASS',
  'API_BASIC_AUTH_PASSWORD',
  'API_BASIC_AUTH_PASS',
  'BASIC_AUTH_PASSWORD',
  'BASIC_AUTH_PASS',
] as const

function readEnvValue(keys: readonly string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }

  return ''
}

function safeEqual(a: string, b: string): boolean {
  return a.length === b.length && a.split('').every((char, index) => char === b[index])
}

export type BasicAuthResult = {
  username: string
} | {
  errorResponse: NextResponse
}

export function verifyBasicAuth(request: Request): BasicAuthResult {
  const expectedUser = readEnvValue(USER_ENV_KEYS)
  const expectedPass = readEnvValue(PASS_ENV_KEYS)

  if (!expectedUser || !expectedPass) {
    const allowedEnvNames = [...USER_ENV_KEYS, ...PASS_ENV_KEYS].join(', ')
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `API auth is not configured on server. Set one username variable and one password variable from: ${allowedEnvNames}`,
        },
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

  if (!safeEqual(username, expectedUser) || !safeEqual(password, expectedPass)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid credentials.' },
        { status: 401 }
      )
    }
  }

  return { username }
}

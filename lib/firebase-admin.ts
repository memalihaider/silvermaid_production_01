import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage as getAdminStorage } from 'firebase-admin/storage'

function normalizePrivateKey(value?: string | null): string | undefined {
  if (!value) return undefined
  // Replace escaped newlines with real newlines
  let key = value.replace(/\\n/g, '\n').trim()
  // Remove surrounding single or double quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim()
  }
  return key || undefined
}

type ServiceAccountLike = {
  projectId?: string
  project_id?: string
  clientEmail?: string
  client_email?: string
  privateKey?: string
  private_key?: string
}

function parseServiceAccountJson(value: string): ServiceAccountLike | null {
  try {
    const parsed = JSON.parse(value) as ServiceAccountLike
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function decodeBase64(value: string): string | null {
  try {
    return Buffer.from(value, 'base64').toString('utf-8')
  } catch {
    return null
  }
}

function readServiceAccountFromEnv(): ServiceAccountLike | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (rawJson) {
    return parseServiceAccountJson(rawJson)
  }

  const rawBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 || process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
  if (!rawBase64) return null

  const decoded = decodeBase64(rawBase64)
  if (!decoded) return null
  return parseServiceAccountJson(decoded)
}

function resolveStorageBucket(projectId?: string): string | undefined {
  const envBucket =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  if (envBucket?.trim()) {
    return normalizeBucketName(envBucket.trim())
  }

  if (!projectId?.trim()) return undefined
  return `${projectId.trim()}.appspot.com`
}

function getProjectBucketCandidates(projectId?: string): string[] {
  if (!projectId?.trim()) return []

  const trimmedProjectId = projectId.trim()
  return [
    `${trimmedProjectId}.appspot.com`,
    `${trimmedProjectId}.firebasestorage.app`,
  ]
}

function getProjectIdFromApp(): string | undefined {
  const appProjectId = adminApp.options.projectId
  if (typeof appProjectId === 'string' && appProjectId.trim()) {
    return appProjectId.trim()
  }

  return process.env.FIREBASE_PROJECT_ID?.trim() || undefined
}

function initFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
  }

  const serviceAccount = readServiceAccountFromEnv()
  if (serviceAccount) {
    const projectId = (serviceAccount.projectId || serviceAccount.project_id || '').trim()
    const clientEmail = (serviceAccount.clientEmail || serviceAccount.client_email || '').trim()
    const privateKey = normalizePrivateKey(serviceAccount.privateKey || serviceAccount.private_key)

    if (projectId && clientEmail && privateKey) {
      const storageBucket = resolveStorageBucket(projectId)
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
        storageBucket,
      })
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

  if (projectId && clientEmail && privateKey) {
    const storageBucket = resolveStorageBucket(projectId)
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
      storageBucket,
    })
  }

  // Fallback to ADC when running on GCP environments that provide workload identity.
  return initializeApp({
    projectId,
    storageBucket: resolveStorageBucket(projectId),
  })
}

const adminApp = initFirebaseAdminApp()
export const adminDb = getFirestore(adminApp)
export { adminApp }

function normalizeBucketName(bucketName: string): string {
  return bucketName.replace(/^gs:\/\//, '').replace(/\/$/, '')
}

export function getAdminStorageBucket() {
  const configuredBucket =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  if (configuredBucket?.trim()) {
    return getAdminStorage(adminApp).bucket(normalizeBucketName(configuredBucket.trim()))
  }

  return getAdminStorage(adminApp).bucket()
}

export function getAdminStorageBucketCandidates() {
  const candidates = [
    process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    adminApp.options.storageBucket,
    ...getProjectBucketCandidates(getProjectIdFromApp()),
  ]

  return candidates
    .map((bucketName) =>
      typeof bucketName === 'string' ? normalizeBucketName(bucketName.trim()) : ''
    )
    .filter((bucketName, index, bucketNames) => Boolean(bucketName) && bucketNames.indexOf(bucketName) === index)
}

export function adminServerTimestamp() {
  return FieldValue.serverTimestamp()
}

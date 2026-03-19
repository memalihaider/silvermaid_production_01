import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

function getPrivateKey(): string | undefined {
  const value = process.env.FIREBASE_PRIVATE_KEY
  if (!value) return undefined
  return value.replace(/\\n/g, '\n')
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

function initFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
  }

  const serviceAccount = readServiceAccountFromEnv()
  if (serviceAccount) {
    const projectId = (serviceAccount.projectId || serviceAccount.project_id || '').trim()
    const clientEmail = (serviceAccount.clientEmail || serviceAccount.client_email || '').trim()
    const privateKey = (serviceAccount.privateKey || serviceAccount.private_key || '').replace(/\\n/g, '\n').trim()

    if (projectId && clientEmail && privateKey) {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      })
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = getPrivateKey()

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    })
  }

  // Fallback to ADC when running on GCP environments that provide workload identity.
  return initializeApp({ projectId })
}

const adminApp = initFirebaseAdminApp()
export const adminDb = getFirestore(adminApp)

export function adminServerTimestamp() {
  return FieldValue.serverTimestamp()
}

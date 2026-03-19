import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

function getPrivateKey(): string | undefined {
  const value = process.env.FIREBASE_PRIVATE_KEY
  if (!value) return undefined
  return value.replace(/\\n/g, '\n')
}

function initFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
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

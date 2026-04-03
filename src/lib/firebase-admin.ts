/**
 * firebase-admin.ts — Firebase Admin SDK singleton
 *
 * Initialises the Firebase Admin app once and exports access to Storage.
 * Uses a service account key supplied via environment variables.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (the full PEM key; newlines as literal \n in .env)
 *   FIREBASE_STORAGE_BUCKET  (e.g. your-project.firebasestorage.app)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getStorage, Storage } from 'firebase-admin/storage'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

function createFirebaseAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]

  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // .env stores \n as a literal backslash-n — replace them with real newlines
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  })
}

const app = createFirebaseAdminApp()

export const adminStorage: Storage = getStorage(app)
export const adminDb: Firestore = getFirestore(app)

function createGbsAdminApp(): App {
  const apps = getApps()
  const currentApp = apps.find(a => a.name === 'gbs-ai-studio')
  if (currentApp) return currentApp

  return initializeApp({
    credential: cert({
      projectId:   process.env.GBS_AI_STUDIO_PROJECT_ID!,
      clientEmail: process.env.GBS_AI_STUDIO_CLIENT_EMAIL!,
      privateKey:  process.env.GBS_AI_STUDIO_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  }, 'gbs-ai-studio')
}

const gbsApp = createGbsAdminApp()
export const gbsAdminDb: Firestore = getFirestore(gbsApp)
export const gbsAuth: Auth = getAuth(gbsApp)

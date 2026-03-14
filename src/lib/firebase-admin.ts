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

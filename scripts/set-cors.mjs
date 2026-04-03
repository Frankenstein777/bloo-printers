/**
 * set-cors.mjs
 *
 * Run once to configure Firebase Storage CORS for the Octoplans bucket.
 * Allows the browser to PUT files directly via presigned URLs.
 *
 * Usage:
 *   node scripts/set-cors.mjs
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to the service account JSON,
 * or run inside a GCP environment with appropriate default credentials.
 *
 * Alternatively, use gsutil:
 *   gsutil cors set scripts/cors.json gs://octoplans.firebasestorage.app
 */

import { Storage } from '@google-cloud/storage'

const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'octoplans.firebasestorage.app'

const corsConfig = [
  {
    origin: [
      'https://www.octoplans.com',
      'https://octoplans.com',
      'http://localhost:3000',
    ],
    method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'HEAD'],
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'X-Requested-With',
      'Origin',
      'Accept',
    ],
    maxAgeSeconds: 3600,
  },
]

async function main() {
  const storage = new Storage()
  const bucket = storage.bucket(BUCKET_NAME)

  console.log(`Setting CORS on bucket: ${BUCKET_NAME}`)
  await bucket.setCorsConfiguration(corsConfig)
  console.log('✅ CORS configuration applied successfully.')
  console.log('Config:', JSON.stringify(corsConfig, null, 2))
}

main().catch((err) => {
  console.error('❌ Failed to set CORS:', err)
  process.exit(1)
})

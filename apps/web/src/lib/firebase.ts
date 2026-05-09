import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null
  return getMessaging(firebaseApp)
}

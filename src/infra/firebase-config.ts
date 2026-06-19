import { type FirebaseOptions, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID
}

export const app = initializeApp(firebaseConfig)

export const firestore = getFirestore(app)

export const auth = getAuth(app)

export const getUserPath = (collection: string) =>
  `users/${auth.currentUser!.uid}/${collection}`

if (import.meta.env.MODE !== 'production') {
  connectAuthEmulator(auth, 'http://localhost:9099', {
    disableWarnings: true
  })
  connectFirestoreEmulator(firestore, 'localhost', 8080)
}

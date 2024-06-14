
// fichier firebase.config.js 

import { initializeApp } from 'firebase/app'
import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY, 
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: "dsh-app",
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
}

// Initialise l'app Firebase 
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting persistence : ", error)
  })
  
export {auth, db, app}

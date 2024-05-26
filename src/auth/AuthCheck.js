
// fichier AuthCheck.js

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase.config'
import { doc, getDoc } from 'firebase/firestore'
import Loader from '../components/Loader'

const AuthCheck = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid))
                    const userData = userDoc.data();
                    
                    if (userData.role === 'commercial') {
                        navigate("/tableau-de-bord-commercial", { state: { uid: user.uid } })
                    } 
                    else if (userData.role === 'administrateur') {
                        navigate("/tableau-de-bord-administrateur", { state: { uid: user.uid } })
                    }
                } 
                catch (error) {
                    console.error("Error fetching user data: ", error)
                }
            } else {
                navigate("/entry")
            }
            setLoading(false)
        })

        return () => unsubscribe()

    }, [navigate])

    if (loading) {
        return <Loader />
    }

    return null
}

export default AuthCheck

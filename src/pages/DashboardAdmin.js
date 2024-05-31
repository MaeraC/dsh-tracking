
// Fichier Dashbaord-Admin.js

import { Route, Routes } from "react-router-dom"
import { Navigate, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { auth , db } from "../firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import PreviewAdmin from "./PreviewAdmin"
import Loader from "../components/Loader"
import HeaderAdmin from "../components/HeaderAdmin"
import SearchVisitsAdmin from "./SearchVisitsAdmin"
import Account from "./Account"
 
function DashboardAdmin() {
    const navigate = useNavigate()

    const [firstname, setFirstname] = useState("")
    const [loading, setLoading] = useState(true)
    const [uid, setUid] = useState(null)
    const [role, setRole] = useState("")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (user) { 
                try {
                    setUid(user.uid)
                    
                    const userDoc = await getDoc(doc(db, "users", user.uid))

                    if (userDoc.exists()) {
                        setFirstname(userDoc.data().firstname)
                        setRole(userDoc.data().role)
                    }
                } 
                catch (error) {
                    console.error("Erreur lors de la récupération des données de l'utilisateur", error)
                }
                setLoading(false)
            } 
            else {
                navigate("/connexion")
            }
        });

        return () => unsubscribe()
    }, [navigate])

    if (loading) {
        return <Loader />
    }


    return (
        <>
        <HeaderAdmin />
        

        <Routes>
            <Route path="/" element={<Navigate to="apercu-admin" replace />} />
            <Route path="apercu-admin" element={<PreviewAdmin firstname={firstname} uid={uid}  />} />
            <Route path="mon-compte-admin" element={<Account />} />
            <Route path="recherche-visites-admin" element={<SearchVisitsAdmin uid={uid} role={role} />} />
        </Routes>
        </>
    )
}

export default DashboardAdmin
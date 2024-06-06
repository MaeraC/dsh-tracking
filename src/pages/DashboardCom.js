
// Fichier Dashbaord-Commercial.js

import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Account from "./Account"
import Preview from "./Preview"
import Header from "../components/Header"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase.config.js"
import { onAuthStateChanged } from "firebase/auth"
import SearchVisits from "./SearchVisits"
import Loader from "../components/Loader.js"
import FDRSemaine from "../components/FDRSemaine.js"
import Geolocation from "../components/Geolocation.js"
import Fiches from "./Fiches.js"
import FeuillesDeRouteSemaine from "./FeuillesDeRouteSemaine.js"

function DashboardCom() {

    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [uid, setUid] = useState(null)
    const navigate = useNavigate() 

   useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (user) { 
                try {
                    setUid(user.uid)
                    
                    const userDoc = await getDoc(doc(db, "users", user.uid))

                    if (userDoc.exists()) {
                        setFirstname(userDoc.data().firstname)
                        setLastname(userDoc.data().lastname)
                        setEmail(userDoc.data().email)
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
       
            <Header />
            <Routes>
                <Route path="/" element={<Navigate to="apercu" replace />} />
                <Route path="apercu" element={<Preview firstname={firstname} uid={uid} />} />
                <Route path="map" element={<Geolocation uid={uid} />} />
                <Route path="questionnaires/*" element={<FDRSemaine uid={uid} />} />
                <Route path="mon-compte" element={<Account firstname={firstname} lastname={lastname} email={email}  />} />
                <Route path="recherche-visites" element={<SearchVisits />} />
                <Route path="fiches" element={<Fiches uid={uid} />} />
                <Route path="feuilles-de-route-de-la-semaine" element={<FeuillesDeRouteSemaine uid={uid} />} />
            </Routes>
       
        </>
        
    )
}

export default DashboardCom
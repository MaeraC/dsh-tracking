
// Fichier Dashbaord-Admin.js

import { Route, Routes }                                from "react-router-dom"
import { Navigate, useNavigate }                        from "react-router-dom"
import { useState, useEffect }                          from "react"
import { auth , db }                                    from "../firebase.config"
import { onAuthStateChanged }                           from "firebase/auth"
import { getDoc, doc }                                  from "firebase/firestore"
import PreviewAdmin                                     from "./PreviewAdmin"
import Loader                                           from "../components/Loader"
import HeaderAdmin                                      from "../components/HeaderAdmin"
import SearchVisitsAdmin                                from "./SearchVisitsAdmin"
import Account                                          from "./Account"
import StatisticsAdmin                                  from "../components/StatisticsAdmin" 
import UnavailabilityHistory                            from "./UnavailabilityHistory"
 
function DashboardAdmin() {
    const navigate                                      = useNavigate()

    const [firstname, setFirstname]                     = useState("")
    const [lastname, setLastname]                       = useState("")
    const [email, setEmail]                             = useState("")
    const [loading, setLoading]                         = useState(true)
    const [uid, setUid]                                 = useState(null)
    const [role, setRole]                               = useState("")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (user) { 
                try {
                    setUid(user.uid)
                    
                    const userDoc = await getDoc(doc(db, "users", user.uid))

                    if (userDoc.exists()) {
                        setFirstname(userDoc.data().firstname)
                        setRole(userDoc.data().role)
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
        <HeaderAdmin />
        
        <Routes>
            <Route path="/" element={<Navigate to="apercu-admin" replace />} />
            <Route path="apercu-admin" element={<PreviewAdmin firstname={firstname} uid={uid}  />} />
            <Route path="stats-admin" element={<StatisticsAdmin uid={uid} />} />
            <Route path="mon-compte-admin" element={<Account firstname={firstname} lastname={lastname} email={email} />} />
            <Route path="recherche-visites-admin" element={<SearchVisitsAdmin uid={uid} role={role} />} />
            <Route path="historique-indisponibilites" element={<UnavailabilityHistory />} />
        </Routes>
        </>
    )
}

export default DashboardAdmin
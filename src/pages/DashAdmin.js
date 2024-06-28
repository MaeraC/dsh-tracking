
// fichier DashAdmin.js

import { useState, useEffect }                              from "react"
import PreviewAdmin                                             from "./PreviewAdmin"
import AccountAdmin                                              from "./AccountAdmin.js"
import SearchVisits                                         from "./SearchVisits"
import Loader                                               from "../components/Loader"
import FichesAdmin                                               from "./FichesAdmin.js"
import { useNavigate }                                      from "react-router-dom"
import { doc, getDoc }                                      from "firebase/firestore"
import { auth, db }                                         from "../firebase.config.js"
import { onAuthStateChanged }                               from "firebase/auth"
import HeaderAdmin from "../components/HeaderAdmin.js" 

function DashAdmin () {
    const [activeTab, setActiveTab]                         = useState("apercu")
    const [firstname, setFirstname]                         = useState("")
    const [lastname, setLastname]                           = useState("")
    const [email, setEmail]                                 = useState("")
    const [loading, setLoading]                             = useState(true)
    const [uid, setUid]                                     = useState(null)
    const navigate                                          = useNavigate() 

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
        <HeaderAdmin activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div style={{ display: activeTab === "apercu" ? "block" : "none" }}>
            <PreviewAdmin firstname={firstname} uid={uid} />
        </div>

        <div style={{ display: activeTab === "mon-compte" ? "block" : "none" }}>
            <AccountAdmin firstname={firstname} lastname={lastname} email={email} />
        </div>
        <div style={{ display: activeTab === "recherche-visites" ? "block" : "none" }}>
            <SearchVisits />
        </div>
        <div style={{ display: activeTab === "fiches" ? "block" : "none" }}>
            <FichesAdmin uid={uid} />
        </div>
        </>
    );
};

export default DashAdmin


// Fichier Login.js

import "../index.css" 
import { Link, useNavigate }                                from "react-router-dom"
import { useState }                                         from "react"
//import { GoogleAuthProvider, signInWithPopup }                       from "firebase/auth"
import { signOut }                                        from "firebase/auth"
import { auth, db }                                         from "../firebase.config.js"
import { doc, getDoc }                                      from "firebase/firestore"
import {  query, getDocs, collection, where, Timestamp }  from "firebase/firestore"
import emailImg                                             from "../assets/email.png"
import mdpImg                                               from "../assets/mdp.png"
import { browserLocalPersistence, setPersistence }          from "firebase/auth"
import { signInWithEmailAndPassword } from "firebase/auth"

function Login() { 
    const [email, setEmail]                                 = useState("")
    const [password, setPassword]                           = useState("")
    const [message, setMessage]                             = useState("")
    const [messageType, setMessageType]                     = useState("")

    const navigate                                          = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            await setPersistence(auth, browserLocalPersistence)

            //const provider = new GoogleAuthProvider()
            //const userCredential = await signInWithPopup(auth, provider);
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
             const userDoc = await getDoc(doc(db, "users", user.uid))
            const userData = userDoc.data()

            // Vérifier si l'utilisateur est un administrateur
            if (userData.role === "administrateur") {
                setMessage("Connexion réussie avec succès !");
                setMessageType("success");

                setTimeout(() => {
                navigate("/tableau-de-bord-administrateur", { state: { uid: user.uid } });
                }, 2000);

                return;
            }

            const unavailabilityQuery = query(
                collection(db, "unavailabilities"),
                where("userId", "==", user.uid),
                where("startDate", "<=", Timestamp.now()),
                where("endDate", ">=", Timestamp.now())
            )
            const unavailabilitySnapshot = await getDocs(unavailabilityQuery)
    
            if (!unavailabilitySnapshot.empty) {
                setMessage("Vous êtes actuellement indisponible et ne pouvez pas vous connecter.")
                setMessageType("indispo");
                await signOut(auth);
                return;
            }

            
            if (isHolidayOrWeekend()) {
                setMessage("Impossible de se connecter durant les week-ends et jours fériés.")
                setMessageType("error")
                return  
            }


            if (userData.role === "commercial") {

                setTimeout(() => {
                    navigate("/tableau-de-bord-commercial", { state : { uid : user.uid } })
                }, "2000")  
            } 

            
            setMessage("Connexion réussie avec succès !")
            setMessageType("success") 
           
        } catch (error) {
            setMessage("Erreur de connexion")
            setMessageType("error")
        }   
    }

    
    
    const isHolidayOrWeekend = () => {
        const today = new Date();
        const day = today.getDay();
        const holidays = ["2024-01-01", "2024-12-25", "2024-05-09", "2024-11-1", "2024-04-01", "2024-05-20", "2024-11-11", "2024-05-01", "2024-07-14", "2024-05-08", "2024-08-15", "2025-01-01", "2025-05-29", "2025-11-01", "2025-04-21", "2025-06-09", "2025-11-11", "2025-05-01", "2025-07-14", "2025-12-25", "2025-05-08", "2025-08-15"]; // Liste des jours fériés (à adapter)
    
        const todayString = today.toISOString().split("T")[0];
    
        
        if (day === 6 || day === 0) {
            setMessage("Impossible de se connecter durant les week-ends.")
            setMessageType("weekend")
        }
        if (holidays.includes(todayString)) {
            setMessage("Impossible de se connecter durant les jours fériés.")
            setMessageType("ferie")
            
        }
        return "";
    }

    return (
        <div className="login-page">
            
            <form className="login-form">
                <h1>CONNEXION</h1>

                <div className="email-input">
                    <img src={emailImg} alt="icone email" />   
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
                </div>
                <div className="email-input">
                    <img src={mdpImg} alt="icone mot de passe" /> 
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" /> 
                </div>
                
                {messageType === "success" && (

                    <div className="success-animation">
                        <div className="circle"> 
                            <div className="checkmark"></div>
                        </div>
                        <span>{message}</span>
                    </div>
                )}

                {messageType === "error" && (
                    <p className="error-message">{message}</p>
                )}

                {messageType === "weekend" && (
                    <p className="error-message">{message}</p>
                )}

{messageType === "ferie" && (
                    <p className="error-message">{message}</p>
                )}

{messageType === "indispo" && (
                    <p className="error-message">{message}</p>
                )}

                <button onClick={handleLogin} className="button-white" >Me connecter</button>
                
                <Link to="" className="link-mdp">Mot de passe oublié ?</Link>
                <Link to="/inscription" className="link-signup">M'inscrire</Link>
                
            </form>
        </div>
    )
}

export default Login


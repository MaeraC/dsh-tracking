
// Fichier Login.js

import "../index.css" 
import { Link, useNavigate }                                from "react-router-dom"
import { useState }                                         from "react"
//import { GoogleAuthProvider, signInWithPopup }                       from "firebase/auth"
//import { signOut }                                        from "firebase/auth"
import { auth, db }                                         from "../firebase.config.js"
import { doc, getDoc }                                      from "firebase/firestore"
//import {  query, getDocs, collection, where, Timestamp }  from "firebase/firestore"
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

            /*
            if (isHolidayOrWeekend()) {
                setMessage("Impossible de se connecter durant les week-ends et jours fériés.")
                setMessageType("error")
                return  
            }*/
            
            //const provider = new GoogleAuthProvider()
            //const userCredential = await signInWithPopup(auth, provider);
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
             const userDoc = await getDoc(doc(db, "users", user.uid))
            const userData = userDoc.data()

            /*
            const unavailabilityQuery = query(
                collection(db, "unavailabilities"),
                where("userId", "==", user.uid),
                where("startDate", "<=", Timestamp.now()),
                where("endDate", ">=", Timestamp.now())
            )
            const unavailabilitySnapshot = await getDocs(unavailabilityQuery)
    
            if (!unavailabilitySnapshot.empty) {
                setMessage("Vous êtes actuellement indisponible et ne pouvez pas vous connecter.")
                setMessageType("error");
                await signOut(auth);
                return;
            }
    */
            setMessage("Connexion réussie avec succès !")
            setMessageType("success") 

            if (userData.role === "commercial") {

                setTimeout(() => {
                    navigate("/tableau-de-bord-commercial", { state : { uid : user.uid } })
                }, "2000")  
            } 
            else if (userData.role === "administrateur") {
                setTimeout(() => {
                    navigate("/tableau-de-bord-administrateur", { state : { uid : user.uid } })
                }, "2000")
            }

        } catch (error) {
            console.log(error.message)
            setMessage("Erreur de connexion. Veuillez vérifier votre adresse e-mail et votre mot de passe.")
            setMessageType("error")
        }
    }

    /*
    const isHolidayOrWeekend = () => {
        const today = new Date();
        const day = today.getDay();
        const holidays = ["2024-01-01", "2024-12-25", "2024-05-09", "2024-11-1", "2024-04-01", "2024-05-20", "2024-11-11", "2024-05-01", "2024-07-14", "2024-05-08", "2024-08-15", "2025-01-01", "2025-05-29", "2025-11-01", "2025-04-21", "2025-06-09", "2025-11-11", "2025-05-01", "2025-07-14", "2025-12-25", "2025-05-08", "2025-08-15"]; // Liste des jours fériés (à adapter)
    
        const todayString = today.toISOString().split("T")[0];
    
        
        if (day === 6 || day === 0 || holidays.includes(todayString)) {
            return true;
        }
        return false; 
    }*/

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

                <button onClick={handleLogin} className="button-white" >Me connecter</button>
                
                <Link to="" className="link-mdp">Mot de passe oublié ?</Link>
                <Link to="/inscription" className="link-signup">M'inscrire</Link>
                
            </form>
        </div>
    )
}

export default Login


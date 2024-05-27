
// Fichier Login.js

import "../index.css" 
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../firebase.config.js"
import { doc, getDoc } from "firebase/firestore"
import emailImg from "../assets/email.png"
import mdpImg from "../assets/mdp.png"

function Login() { 
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            const userDoc = await getDoc(doc(db, "users", user.uid))
            const userData = userDoc.data()
    
            setMessage("Connexion réussie avec succès !")
            setMessageType("success") 

            if (userData.role === "commercial") {

                setTimeout(() => {
                    //navigate("/tableau-de-bord-commercial", { state : { uid : user.uid } })
                }, "3000")  
            } 
            else if (userData.role === "administrateur") {
                navigate("/tableau-de-bord-administrateur", { state : { uid : user.uid } })
            }

        } catch (error) {
            console.log(error.message)
            setMessage("Erreur de connexion. Veuillez vérifier votre adresse e-mail et votre mot de passe.")
            setMessageType("error")
        }
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
                
                {messageType === "success" ? (

                    <div className="success-animation">
                        <div className="circle"> 
                            <div className="checkmark"></div>
                        </div>
                        <span>{message}</span>
                    </div>
                ) : (
                    <p className="error-message">Connexion échouée</p>
                )}

                <button onClick={handleLogin} className="button-white" >Me connecter</button>
                
                <Link to="" className="link-mdp">Mot de passe oublié ?</Link>
                <Link to="/inscription" className="link-signup">M'inscrire</Link>
                
            </form>
        </div>
    )
}

export default Login
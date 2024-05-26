
// Fichier Login.js

import "../index.css" 
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../firebase.config.js"
import { doc, getDoc } from "firebase/firestore"

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
    
            setMessage("Connexion réussie")
            setMessageType("success") 

            if (userData.role === "commercial") {
                navigate("/tableau-de-bord-commercial", { state : { uid : user.uid } })
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

                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre Email"
                /><br></br>
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                /><br></br>

                <button onClick={handleLogin} >Me connecter</button>
                <Link to="/inscription" className="link">M'inscrire</Link>
                <p className={messageType === "success" ? "sucess-message" : "error-message"}>{message}</p>
            </form>
        </div>
    )
}

export default Login
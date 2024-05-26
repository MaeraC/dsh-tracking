
// Fichier SignUp.js

import "../index.css" 
import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../firebase.config.js"
import { doc, setDoc } from "firebase/firestore"
import { Link, useNavigate } from "react-router-dom"


function SignUp() {
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [role, setRole] = useState("")

    const navigate = useNavigate()

    const handleSignUp = async (e) => {
        e.preventDefault()

        if (password.length < 6) {
            setMessage("Le mot de passe doit contenir au moins 6 caractères.")
            setMessageType("error")
        }

        if (!role) {
            setMessage("Veuillez sélectionner un rôle.")
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            const userRef = doc(db, "users", user.uid)

            await setDoc(userRef, {
                uid: user.uid,
                firstname: firstname,
                lastname: lastname,
                email: email,
                role: role
            }) 

            setMessage("Inscription réussie")
            setMessageType("success")
            navigate("/connexion")
            
        }
        catch (error) {
            console.error("Erreur lors de l'inscription", error)
            setMessage("Inscription échouée")
            setMessageType("error")
        }
    }


    return (
        <div className="signup-page">
            
            <form className="signup-form">
                <h1>INSCRIPTION</h1>

                <input 
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="Votre prénom"
                /><br></br>
                <input 
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Votre nom"
                /><br></br>
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
                <label>
                    <input
                        className="checkbox"                     
                        type="radio"
                        value="administrateur"
                        checked={role === "administrateur"}
                        onChange={(e) => setRole(e.target.value)}
                    />
                    Compte administrateur
                </label><br></br>
                <label>
                    <input 
                        className="checkbox"
                        type="radio"
                        value="commercial"
                        checked={role === "commercial"}
                        onChange={(e) => setRole(e.target.value)}
                    />
                    Compte commercial
                </label>
                <button onClick={handleSignUp} >M'inscrire</button>
                <Link to="/connexion" className="link">Me connecter</Link>
                <p className={messageType === "success" ? "sucess-message" : "error-message"}>{message}</p>
            </form>
        </div>
    )
}

export default SignUp

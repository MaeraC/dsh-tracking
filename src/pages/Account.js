
// Fichier Account
 
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { logout } from "../auth/AuthUtils"
import { auth } from "../firebase.config"
import { sendPasswordResetEmail } from "firebase/auth"

function Account({ email, firstname, lastname }) {
    
    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handleResetPassword = async () => {
        try {
            const email = auth.currentUser.email
            
            sendPasswordResetEmail(auth, email)
            .then(() => {
                setMessage("Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.")
            })
            
        } 
        catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail de réinitialisation du mot de passe :", error)
            setMessage("Une erreur s'est produite lors de l'envoi de l'e-mail de réinitialisation du mot de passe. Veuillez réessayer.")
        }
    }

    return (
        <div className="account">
            <header className="account-header">
                <h1>Mon compte</h1>
            </header>
            
            <div className="content">
                <div>
                    <span>Prénom</span>
                    <p>{firstname}</p>
                </div>
                <div>
                    <span>Nom</span>
                    <p>{lastname}</p>
                </div>
                <div>
                    <span>E-mail</span>
                    <p>{email}</p>
                </div>
                
                <button onClick={handleResetPassword}>Réinitialiser mon mot de passe</button>
                <button onClick={handleLogout}>Déconnexion</button>
            </div>
            
            <p className="success">{message}</p>
        </div>
    )
}

export default Account
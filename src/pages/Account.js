
// Fichier Account
 
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { logout } from "../auth/AuthUtils"
import { auth } from "../firebase.config"

function Account() {
    
    const [message, setMessage] = useState("")

    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handleResetPassword = async () => {
        try {
            const email = auth.currentUser.email // Récupère l'e-mail du user connecté
            await auth.sendPasswordResetEmail(email) // Envoie un e-mail de réinitialisation du mot de passe à cet e-mail
            
            setMessage("Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.")
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
                <button onClick={handleLogout}>Déconnexion</button>
                <button onClick={handleResetPassword}>Réinitialiser mon mot de passe</button>
            </div>
            
            <p className="success">{message}</p>
        </div>
    )
}

export default Account
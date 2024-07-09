

// Fichier Account
 
import { useNavigate }                                  from "react-router-dom"
import { useState }                                     from "react"
import { logout }                                       from "../auth/AuthUtils" 
import { sendPasswordResetEmail }                       from "firebase/auth"
import { auth } from "../firebase.config"

function AccountAdmin({ email, firstname, lastname }) {
    const [showModal, setShowModal]                     = useState(false)
    // eslint-disable-next-line 
    const [message, setMessage] = useState("")
    const [action, setAction]                           = useState(null)
   
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

    const confirmAction = () => {
        if (action === "logout") {
            handleLogout()
        } 
        else if (action === "resetPassword") {
            handleResetPassword()
        }

        setShowModal(false)
    }

    const openModal = (actionType) => {
        setAction(actionType)
        setShowModal(true)
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
                
                <button onClick={() => openModal("resetPassword")}>Réinitialiser mon mot de passe</button>
                <button onClick={() => openModal("logout")}>Déconnexion</button>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Êtes-vous sûr de vouloir {action === "logout" ? "vous déconnecter" : "réinitialiser votre mot de passe"} ?</p>
                        <button onClick={confirmAction}>Oui</button>
                        <button onClick={() => setShowModal(false)}>Non</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AccountAdmin

// Fichier Account
 
import { useNavigate }                                  from "react-router-dom"
import { useEffect, useState }                                     from "react"
import { logout }                                       from "../auth/AuthUtils"
import { auth, db }                                         from "../firebase.config"
import { sendPasswordResetEmail }                       from "firebase/auth"
import { getDoc, doc, updateDoc } from "firebase/firestore"

function Account({ email, firstname, lastname, uid }) {
    
    const [message, setMessage]                         = useState("")
    const [showModal, setShowModal]                     = useState(false)
    const [showModalAdress, setShowModalAdress]         = useState(false)
    const [action, setAction]                           = useState(null)
    const [adresse, setAdresse] = useState("")
    const [city, setCity] = useState("")
    const [userAdresse, setUserAdresse] = useState("")
    const [userCity, setUserCity] = useState("")

    const navigate                                      = useNavigate()

    useEffect(() => {
        const fetchAdress = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", uid))

                if (userDoc.exists()) {
                    const data = userDoc.data()

                    if (data.adresse && data.city) {
                        setUserAdresse(data.adresse)
                        setUserCity(data.city)
                    }
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'adresse :", error)
            }
        }

        fetchAdress()
    }, [uid])

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

    const handleAdressSave = async () => {
        try {
            const userDoc = doc(db, "users", uid)
            await updateDoc(userDoc,   
                {adresse: `${adresse}`, city: `${city}`}, 
                {merge : true}
            )

            setUserAdresse(`${adresse}`)
            setUserCity(`${city}`)
            setShowModalAdress(false)
        }
        catch (error) {
            console.error("Erreur lors de l'enregistrement de l'adresse :", error)
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
                <div className="adresse-btn" onClick={() => setShowModalAdress(true)}>  
                   <span>Adresse de départ</span> 
                   <p className={!userAdresse ? "adresse-txt" : ""}>{userAdresse ? `${userAdresse}, ${userCity}` : "Veuiller définir une adresse"}</p>
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

            {showModalAdress && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Veuillez saisir une adresse et une ville de départ</p>
                        <input type="text" placeholder="Votre adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                        <input type="text" placeholder="Votre ville" value={city} onChange={(e) => setCity(e.target.value)} />
                        <button className="validate-btn" onClick={handleAdressSave}>Valider</button><br></br>
                        <button className="cancel-btn" onClick={() => setShowModalAdress(false)} >Annuler</button>
                    </div>
                </div>
            )}
            
            <p className="success">{message}</p>
        </div>
    )
}

export default Account
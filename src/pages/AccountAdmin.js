





// Fichier Account
 
import { useNavigate }                                  from "react-router-dom"
import { useState, useEffect }                                     from "react"
import { logout }                                       from "../auth/AuthUtils" 
import { sendPasswordResetEmail }                       from "firebase/auth"
import { db, auth } from "../firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, addDoc, Timestamp, getDoc, doc } from "firebase/firestore"
import ManageAvailability from "../components/ManageAvailability"

function AccountAdmin({ email, firstname, lastname }) {
     
    const [showModal, setShowModal]                     = useState(false)
    const [showManage, setShowManage]                     = useState(false)
    const [showForm, setShowForm]                     = useState(false)
    const [action, setAction]                           = useState(null)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [message, setMessage] = useState("")
    const [admin, setAdmin] = useState({})

    const navigate                                      = useNavigate()

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

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"))

            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            setUsers(usersList)
        }

        const fetchAdmin = async (user) => {
            const adminDoc = await getDoc(doc(db, "users", user.uid))
            setAdmin({ id: user.uid, ...adminDoc.data() })
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchAdmin(user)
            }
        })

        fetchUsers()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedUser || !selectedReason || !startDate || !endDate) {
            setMessage("Veuillez remplir tous les champs.")
            return
        }

        const reason = selectedReason === "Autre" ? customReason : selectedReason

        try {
            await addDoc(collection(db, "unavailabilities"), {
                userId: selectedUser,
                reason: reason,
                startDate: Timestamp.fromDate(new Date(startDate)),
                endDate: Timestamp.fromDate(new Date(endDate)),
                adminName: `${admin.firstname} ${admin.lastname}`
            })

            setMessage("Indisponibilité ajoutée avec succès. L'utilisateur ne pourra pas se connecter durant la période saisie.")
            // Réinitialiser le formulaire
            setSelectedUser("")
            setSelectedReason("")
            setCustomReason("")
            setStartDate("")
            setEndDate("")

            setShowForm(false)
        } 
        catch (error) {
            console.error("Erreur lors de l'ajout de l'indisponibilité: ", error)
            setMessage("Erreur lors de l'ajout de l'indisponibilité.")
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
                
                <button onClick={() => openModal("resetPassword")}>Réinitialiser mon mot de passe</button>
                <button onClick={() => openModal("logout")}>Déconnexion</button>
                <button className="button" onClick={() => setShowManage(true)}>Rendre indisponible un commercial</button>
                <ManageAvailability />
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

    
            {showManage && (
                <section className="modal-manage">
                
            <form onSubmit={handleSubmit}>
                <h2>Indisponibilités</h2>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Sélectionnez un commercial</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                    ))}
                </select>

                <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                    <option value="">Sélectionnez une raison</option>
                    <option value="Arrêt maladie">Arrêt maladie</option> 
                    <option value="Congé vacances">Congés vacances</option>
                    <option value="Autre">Autre</option>
                </select>

                {selectedReason === "Autre" && (
                    <div>
                        <input 
                            type="text" 
                            value={customReason} 
                            onChange={(e) => setCustomReason(e.target.value)} 
                            placeholder="Entrez la raison" 
                        />
                    </div>
                )}

                <label>Date de début</label><br></br>
                <input className="custom-select" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <label>Date de fin</label><br></br>
                <input className="custom-select" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <button className="button-colored" type="submit">Déconnecter le commercial</button>
                <button className="cancel" onClick={() => setShowManage(false)}>Annuler</button>
            </form>
            {message && <p className="success">{message}</p>}
            </section>
            )}
            
            <p className="success">{message}</p>
        </div>
    )
}

export default AccountAdmin
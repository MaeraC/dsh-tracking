
// Fichier PreviewAdmin

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import StatisticsAdmin from "../components/StatisticsAdmin" 
import { collection, getDocs, getDoc, Timestamp, addDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "../firebase.config" 
import back from "../assets/back.png" 

function PreviewAdmin({ firstname, uid }) {
    const [signUpModal, setSignUpModal] = useState(false)
    const [showManage, setShowManage]                     = useState(false)
    const [show, setShow] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedReason, setSelectedReason] = useState(""); 
    const [customReason, setCustomReason] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    // eslint-disable-next-line
    const [message, setMessage] = useState("")
    const [admin, setAdmin] = useState({})
    const [unavailabilities, setUnavailabilities] = useState([])
    const [userNames, setUserNames] = useState({})
    const [showHistorique, setShowHistorique] = useState(false)
    const [historique, setHistorique] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUnavailabilities = async () => {
            const unavailabilitySnapshot = await getDocs(collection(db, "unavailabilities"))
            const unavailabilityList = unavailabilitySnapshot.docs.map(doc => doc.data())
            setUnavailabilities(unavailabilityList)
        }

        const fetchUserNames = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"))

            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            const userNameMap = {}

            usersList.forEach(user => {
                userNameMap[user.id] = `${user.firstname} ${user.lastname}`
            })

            setUserNames(userNameMap)
        }

        const fetchHistorique = async () => {
            const historiqueSnapshot = await getDocs(collection(db, "historiqueAdmin"))
            const historiqueList = historiqueSnapshot.docs.map(doc => doc.data())
            setHistorique(historiqueList)
        }

        fetchUnavailabilities()
        fetchUserNames()
        fetchHistorique()
    }, [])

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

            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `VRP ${userNames[selectedUser]} déconnecté par l'admin`, 
            })

            setMessage("Indisponibilité ajoutée avec succès. L'utilisateur ne pourra pas se connecter durant la période saisie.")
            // Réinitialiser le formulaire
            setSelectedUser("")
            setSelectedReason("")
            setCustomReason("")
            setStartDate("")
            setEndDate("")

            setShowManage(false)
        } 
        catch (error) {
            console.error("Erreur lors de l'ajout de l'indisponibilité: ", error)
            setMessage("Erreur lors de l'ajout de l'indisponibilité.")
        }
    }

    

    return (
        <div className="preview-section preview-admin">
            <header>
                <h1>Tableau de bord</h1>  
            </header>

            <div className="hello">
                <h2>Bonjour, <span className="name">{firstname}</span> !</h2>
                <p>Voici votre tableau de gestion administrateur</p>
            </div>

            <div className="content">
            <StatisticsAdmin />

                <div className="droits-admin"> 
                    <h2>Sélectionner une action</h2>
                    <button className="button" onClick={() => setSignUpModal(true)} >Inscrire un nouvel utilisateur</button>
                    <button className="button" onClick={() => setShowManage(true)}>Rendre indisponible un VRP</button>
                    <button className="button" onClick={() => setShow(true)} >Voir la fiche d'indisponibilités</button>
                    <button className="button" onClick={() => setShowHistorique(true)}>Voir l'historique des actions admin</button>
                </div>

                
            </div>

            {signUpModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>Vous allez être redirigé vers la page d'inscription.<br></br>Êtes-vous sûr de vouloir inscrire un nouvel utilisateur ?</p>
                        <div className="mini-buttons">
                            <button onClick={() => navigate("/inscription")}>Oui</button>
                            <button onClick={() => setSignUpModal(false)}>Non</button>
                        </div>
                    </div> 
                </div>
            )}

            {showManage && (
                <section className="modal">
                    <form onSubmit={handleSubmit} className="modal-content modal-form">
                        <h2>Indisponibilités</h2>
                        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                            <option value="">Sélectionnez un commercial</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                            ))}
                        </select><br></br>

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

                        <label className="label">Date de début</label>
                        <input className="custom-select" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <label className="label">Date de fin</label>
                        <input className="custom-select" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                        <button className="button-colored" type="submit">Déconnecter le commercial</button><br></br>
                        <button className="cancel" onClick={() => setShowManage(false)}>Annuler</button>
                    </form>
                </section>
            )}

            {show && (
                <div className="tableau-indispo">
                    <button onClick={() => setShow(false)} className="button-back"><img src={back} alt="retour" /></button>
                    <h2>Historique des indisponibilités</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Administrateur</th>
                                <th>Commercial</th>
                                <th>Date de début</th>
                                <th>Date de fin</th>
                                <th>Raison</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unavailabilities.map((unavailability, index) => (
                                <tr key={index}>
                                    <td>{unavailability.adminName}</td>
                                    <td>{userNames[unavailability.userId] || "Nom non trouvé"}</td>
                                    <td>{new Date(unavailability.startDate?.seconds * 1000).toLocaleDateString()}</td>
                                    <td>{new Date(unavailability.endDate?.seconds * 1000).toLocaleDateString()}</td>
                                    <td>{unavailability.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showHistorique && (
                <div className="modal-page">
                     <button onClick={() => setShowHistorique(false)} className="button-back"><img src={back} alt="retour" /></button>
                    <div>
                        <h2 style={{margin: "20px 0"}}>Historique des actions des administrateurs</h2>

                        <table className="tableau-action-admin" border="1">
                            <thead>
                                <tr style={{background: "#3D9B9B", color: "white"}}>    
                                    <th style={{width: "40%"}}>Action</th>
                                    <th style={{width: "30%"}}>Administrateur</th>
                                    <th style={{width: "30%"}}>Date</th>
                                </tr> 
                            </thead>
                            <tbody>
                                {historique.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.action}</td>
                                        <td>{userNames[entry.userId]}</td>
                                        <td>{new Date(entry.date?.seconds * 1000).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PreviewAdmin  
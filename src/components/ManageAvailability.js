
// Fichier ManageAvailability.js

import { useState, useEffect } from "react"
import { db, auth } from "../firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, addDoc, Timestamp, getDoc, doc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

function ManageAvailability() {
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [message, setMessage] = useState("")
    const [admin, setAdmin] = useState({})
    const [showForm, setShowForm] = useState(false)

    const navigate = useNavigate()

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
        <section className="available-section">
            <button className="button" onClick={() => setShowForm(true)}>Rendre indisponible un commercial</button>

            {showForm && (
                <>
                <form onSubmit={handleSubmit}>

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

                    <label>Date de début</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <label>Date de fin</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    <button className="button-colored" type="submit">Déconnecter le commercial</button>
                </form>
                {message && <p className="success">{message}</p>}
                </>
            )}

            <button className="button" onClick={() => navigate("/tableau-de-bord-administrateur/historique-indisponibilites")}>Voir la fiche d'indisponibilité</button>
        </section>
    );
}

export default ManageAvailability;

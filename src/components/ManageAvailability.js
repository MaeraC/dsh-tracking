
// Fichier ManageAvailability.js

import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";

function ManageAvailability() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [reason, setReason] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUser || !reason || !startDate || !endDate) {
            setMessage("Veuillez remplir tous les champs.");
            return;
        }

        try {
            await addDoc(collection(db, "unavailabilities"), {
                userId: selectedUser,
                reason: reason,
                startDate: Timestamp.fromDate(new Date(startDate)),
                endDate: Timestamp.fromDate(new Date(endDate))
            });
            setMessage("Indisponibilité ajoutée avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'indisponibilité: ", error);
            setMessage("Erreur lors de l'ajout de l'indisponibilité.");
        }
    };

    return (
        <div>
            <h2>Gérer les indisponibilités</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Commercial:
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        <option value="">Sélectionnez un commercial</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstname} {user.lastname}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Raison:
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                        <option value="">Sélectionnez une raison</option>
                        <option value="Arrêt maladie">Arrêt maladie</option>
                        <option value="Congé vacances">Congé vacances</option>
                    </select>
                </label>
                <label>
                    Date de début:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    Date de fin:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
                <button className="button-colored" type="submit">Ajouter</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default ManageAvailability;

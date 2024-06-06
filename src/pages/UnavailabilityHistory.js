
// Fichier UnavailabilityHistory.js

import { useState, useEffect } from "react"
import { db } from "../firebase.config"
import { collection, getDocs } from "firebase/firestore"
import back from "../assets/back.png"
import { useNavigate } from "react-router-dom"

function UnavailabilityHistory() {
    const [unavailabilities, setUnavailabilities] = useState([])
    const [userNames, setUserNames] = useState({})

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

        fetchUnavailabilities()
        fetchUserNames()
    }, [])

    return (
        <div className="tableau-indispo">
            <button onClick={() => navigate("/tableau-de-bord-administrateur/apercu-admin")} className="button-back"><img src={back} alt="retour" /></button>
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
                            <td>{new Date(unavailability.startDate.seconds * 1000).toLocaleDateString()}</td>
                            <td>{new Date(unavailability.endDate.seconds * 1000).toLocaleDateString()}</td>
                            <td>{unavailability.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UnavailabilityHistory;


// Fichier SearchVisits.js

import { useState } from "react"
import { getDocs, query, where, collection } from "firebase/firestore"
import { db } from "../firebase.config.js"

function SearchVisits() {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [salonName, setSalonName] = useState("")
    const [searchResults, setSearchResults] = useState([])

    const handleSearch = async () => {
        try {
            const visitsRef = collection(db, "visits") // liste totale des visites enregistrées
            let filteredQuery = query(visitsRef)

            // Convertion des dates dans le format utilisé dans la base de données
            const formattedStartDate = startDate.split('-').reverse().join('/')
            const formattedEndDate = endDate.split('-').reverse().join('/')

            // filtre par période
            if (startDate && endDate) {
                filteredQuery = query(filteredQuery, where("exactDate", ">=", formattedStartDate), where("exactDate", "<=", formattedEndDate))
            }

            // filtre par le nom du salon
            if (salonName) {
                filteredQuery = query(filteredQuery, where("salonName", "==", salonName))
            }

            const querySnapshot = await getDocs(filteredQuery)
            const visitsData = querySnapshot.docs.map(doc => doc.data())

            setSearchResults(visitsData)
        } 
        catch (error) {
            console.error("Erreur lors de la recherche des visites :", error)
        }
    }

    return (
        <section className="search-section">
            <header>
                <h1>Recherche par filtres</h1>
            </header>

            <div className="search-filter">
                
                <div>
                    <label htmlFor="startDate">Date de début :</label>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="endDate">Date de fin :</label>
                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="salonName"></label>
                    <input type="text" id="salonName" value={salonName} placeholder="Nom du salon" onChange={(e) => setSalonName(e.target.value)} />
                </div>
                <button className="button-colored" onClick={handleSearch}>Rechercher</button>
            </div>

            {searchResults.length > 0 && (
                <div className="search-results">

                    <p className="nb-visit">Nombre de visites pour le salon {salonName} : {searchResults.length}</p>
                    
                    {searchResults.map((visit, index) => (
                        <div key={index}>
                            <p><span>Nom du salon</span> : {visit.salonName}</p>
                            <p><span>Status</span> : {visit.status}</p>
                            <p><span>Ville</span> : {visit.city}</p>
                            <p><span>Date exacte</span> : {visit.exactDate}</p>
                            <p><span>Date détectée</span> : {visit.detectedDate}</p>
                            <p><span>Semaine</span> : {visit.week}</p>
                        </div>
                    ))}
                    
                </div>
            )}
        </section>
    )
}

export default SearchVisits
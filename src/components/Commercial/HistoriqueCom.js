
// fichier HistoriqueCom.js

import back from "../../assets/back.png"
import { useState, useEffect } from "react" 
import { db } from "../../firebase.config"
import { query, collection, where, getDocs, getDoc, doc } from 'firebase/firestore'

function HistoriqueCom({ onReturn }) {
    const [suggestions, setSuggestions] = useState([])
    const [searchSalon, setSearchSalon] = useState("")
    const [selectedSalon, setSelectedSalon] = useState(null)
    const [historique, setHistorique] = useState([])
    const [loading, setLoading] = useState(false)
    const [nombreVisites, setNombreVisites] = useState(0)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [searchCity, setSearchCity] = useState("")
    const [citySuggestions, setCitySuggestions] = useState([])
    const [selectedCity, setSelectedCity] = useState(null)
    const [message, setMessage] = useState(false)

    const handleSearch = async (e) => {
        const searchValue = e.target.value
        setSearchSalon(searchValue)
        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q)
                const searchResults = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    searchResults.push({ id: doc.id, ...data })
                })
                setSuggestions(searchResults)
            } 
            catch (error) {
                console.error("Erreur lors de la recherche du salon : ", error);
            }
        } else {
            setSuggestions([])
        }
    }
    const handleSelectSuggestion = async (salon) => {
        setSelectedSalon(salon)
        setSuggestions([])
        setSearchSalon(salon.name)
    }
    const handleCitySearch = async (e) => {
        const searchValue = e.target.value;
        setSearchCity(searchValue);

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("city", ">=", searchValue), where("city", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q);
                const searchResults = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (!searchResults.some(city => city.name === data.city)) {
                        searchResults.push({ id: doc.id, name: data.city });
                    }
                });
                setCitySuggestions(searchResults);
            } catch (error) {
                console.error("Erreur lors de la recherche de la ville : ", error);
            }
        } else {
            setCitySuggestions([]);
        }
    }
    const handleSelectCitySuggestion = (city) => {
        setSelectedCity(city);
        setCitySuggestions([]);
        setSearchCity(city.name);
    }
    const filterHistoriqueByDate = (historiqueData) => { 
        if (!startDate || !endDate) {
            return historiqueData
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        if (start > end) {
            alert("La date de début doit être antérieure à la date de fin.")
            return []
        }

        const filteredData = historiqueData.filter(entry => {
            const entryDate = entry.date.toDate()
            return entryDate >= start && entryDate <= end
        })

        return filteredData
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedCity) {
            setMessage("Veuillez sélectionner une ville.")
            return;
        }
        if (!selectedSalon) {
            setMessage("Veuillez sélectionner un salon.")
            return;
        }
        if (!startDate || !endDate) {
            setMessage("Veuillez sélectionner une période.")
            return
        }
    
        setLoading(true)
    
        try {
            const salonRef = doc(db, "salons", selectedSalon.id)
            const salonDoc = await getDoc(salonRef)
    
            if (salonDoc.exists()) {

                const data = salonDoc.data()
                const historiqueData = data.historique || []
                const filteredData = filterHistoriqueByDate(historiqueData)

                filteredData.sort((a, b) => b.date.seconds - a.date.seconds)
                setHistorique(filteredData)
                
                const visitesCount = filteredData.filter(entry => entry.action === "Nouvelle visite").length
                setNombreVisites(visitesCount)
            } 
            else {
                setHistorique([])
                setNombreVisites(0)
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique du salon : ", error)
            setHistorique([])
            setNombreVisites(0)
        }
    
        setLoading(false)
    }

    return (
        <div className="historique-section">
             <div className="title-fiche">
                <h1>Historique des salons</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>
            <div className="historique-content">
                <div className="filter-historique">
                    <label>Filtrer par nom</label>
                    <input type="text" placeholder="Rechercher un salon" value={searchSalon} onChange={handleSearch} />
                    <div className="select-sugg">
                        {suggestions.map((salon) => (
                            <div key={salon.id} onClick={() => handleSelectSuggestion(salon)}
                                style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >
                                {salon.name}
                            </div>
                        ))}
                    </div>
                    <label>Filtrer par ville</label>
                    <input type="text" placeholder="Rechercher une ville" value={searchCity} onChange={handleCitySearch} required />
                    <div className="select-sugg">
                            {citySuggestions.map((city) => (
                                <div key={city.id} onClick={() => handleSelectCitySuggestion(city)}
                                    style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >
                                    {city.name}
                                </div>
                            ))}
                        </div>
                    <div> 
                        <label>Date de début</label>
                        <input type="date"  className='custom-select' value={startDate} onChange={(e) => setStartDate(e.target.value)} /><br></br>
                        <label>Date de fin </label>
                        <input type="date"  className='custom-select'value={endDate} onChange={(e) => setEndDate(e.target.value)} />  <br></br>
                        <p style={{textAlign: "center"}} className="error-message">{message}</p>
                        <button className="button-colored" type="submit" onClick={handleSubmit}>valider la recherche</button>
                    </div>
                </div>

                {loading ? (
                    <div>Loading...</div>
                
                ) : selectedSalon && historique.length > 0 ? (
                    <div className="historique-results">
                        <h2>Historique du salon {selectedSalon.name}</h2>
                        <p className="nb-visit">Nombre de visites: <span>{nombreVisites}</span></p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historique.map((entry, index) => {
                                    return (
                                        <tr key={index}>
                                        <td>{entry.action}</td>
                                        <td>{new Date(entry.date.seconds * 1000).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</td>
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    selectedSalon && (<div>Appuyer sur le bouton de recherche</div>)
                )}
            </div>
        </div>
    )
}

export default HistoriqueCom

// fichier Historique.js

import back from "../assets/back.png"
import { useState, useEffect } from "react" 
import { db } from "../firebase.config"
import { query, collection, where, getDocs, getDoc, doc } from 'firebase/firestore'

function Historique({ onReturn }) {
    const [suggestions, setSuggestions] = useState([])
    const [searchSalon, setSearchSalon] = useState("")
    const [selectedSalon, setSelectedSalon] = useState(null)
    const [historique, setHistorique] = useState([])
    const [loading, setLoading] = useState(false)
    const [nombreVisites, setNombreVisites] = useState(0)
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [usersMap, setUsersMap] = useState({})

   // Récupère les nom et prénom des users
    useEffect(() => {
        const fetchUsersData = async () => {
            const usersData = {};
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach((doc) => {
                    usersData[doc.id] = doc.data();
                });
                setUsersMap(usersData);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error);
            }
        }; 
        fetchUsersData();
    }, []);

    // Recherche un salon dans la collection salons de la bdd 
    const handleSearch = async (e) => {
        const searchValue = e.target.value
        setSearchSalon(searchValue)

        if (searchValue.length > 0) {
            try {
                const q = query(collection(db, "salons"), where("name", ">=", searchValue), where("name", "<=", searchValue + "\uf8ff"));
                const querySnapshot = await getDocs(q);

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
        setLoading(true)

        try {
            const salonRef = doc(db, "salons", salon.id)
            const salonDoc = await getDoc(salonRef)

            if (salonDoc.exists()) {
                const data = salonDoc.data()
                const historiqueData = data.historique || [];
                setHistorique(historiqueData);

                // Calculer le nombre de visites
                const visitesCount = historiqueData.filter(entry => entry.action === "Nouvelle visite").length;
                setNombreVisites(visitesCount);
            } 
            else {
                setHistorique([])
                setNombreVisites(0);
            }
        } 
        catch (error) {
            console.error("Erreur lors de la récupération de l'historique du salon : ", error)
            setHistorique([])
            setNombreVisites(0);
        }
        setLoading(false)
    }

    const handlePrintHistorique = () => {
        window.print()
    }

    const handleDateChange = () => {
        if (!startDate || !endDate) {
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
            alert("La date de début doit être antérieure à la date de fin.");
            return;
        }

        const filteredHistorique = historique.filter(entry => {
            const entryDate = new Date(entry.date.seconds * 1000);
            return entryDate >= start && entryDate <= end;
        });

        const visitesCount = filteredHistorique.filter(entry => entry.action === "Nouvelle visite").length;
        setNombreVisites(visitesCount);
    }

    // Fonction pour formater les clés
    const formatKey = (key) => {
        // Convertir camelCase en texte lisible avec une majuscule au début et des espaces
        const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // Ajouter un espace avant chaque lettre majuscule
        return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1); // Mettre la première lettre en majuscule
    };

    // Fonction pour afficher la valeur du champ
    const renderFieldValue = (value) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
            // Si la valeur est un objet (potentiellement un sous-champ)
            return (
                <div>
                    {Object.keys(value).map((subKey, i) => (
                        value[subKey] !== null && value[subKey] !== undefined && value[subKey] !== '' && (
                            <li className="sous-champs" key={i}> 
                            <tr className="sous-champs-key"><strong>{formatKey(subKey)}:</strong></tr>
                            <tr className="sous-champs-value">{renderFieldValue(value[subKey])}</tr>
                            </li>
                        )
                    ))}
                </div>
            )
        } else if (Array.isArray(value)) {
            // Si la valeur est un tableau (potentiellement un tableau imbriqué)
            return (
                <div>
                    {value.map((item, i) => (
                        item !== null && item !== undefined && item !== '' && (
                            <li key={i} className="sous-champs">{renderFieldValue(item)}</li> 
                        )
                    ))}
                </div>
            );
        } else {
            // Sinon, afficher la valeur directement si elle n'est pas vide
            return value;
        }
    };

    // Fonction pour rendre les données du formulaire
    const renderFormData = (formData) => {
        if (!formData) return null;

        // Exclure les champs userId, createdAt et typeOfForm
        const filteredKeys = Object.keys(formData).filter(key => !['userId', 'createdAt', 'typeOfForm'].includes(key));

        // Filtrer les clés pour supprimer celles avec des valeurs vides ou des objets vides
        const nonEmptyKeys = filteredKeys.filter(key => {
            const value = formData[key];
            if (typeof value === 'object' && !Array.isArray(value)) {
                // Si la valeur est un objet (potentiellement un sous-champ), vérifier récursivement
                return Object.keys(value).some(subKey => {
                    const subValue = value[subKey];
                    return subValue !== null && subValue !== undefined && subValue !== '';
                });
            } else if (Array.isArray(value)) {
                // Si la valeur est un tableau (potentiellement un tableau imbriqué), vérifier récursivement
                return value.some(item => {
                    return item !== null && item !== undefined && item !== '';
                });
            } else {
                // Sinon, vérifier si la valeur n'est pas vide
                return value !== null && value !== undefined && value !== '';
            }
        });

        // Trier les clés (si nécessaire)
        nonEmptyKeys.sort(); // Par exemple, tri alphabétique

        return (
            <div>
            {nonEmptyKeys.map((key, index) => (
                <div key={index}>
                    
                    <tr className="key"><strong>{formatKey(key)}</strong></tr>
                    <tr className="key-value">{renderFieldValue(formData[key])}</tr>
                </div>
            ))}
        </div>
            
        );
    };
    
    return (
        <div className="historique-section">
            <button onClick={onReturn} className="button-back">
                <img src={back} alt="retour" />
            </button>
            <h3>Historique des salons</h3>
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
                <div>
                    <label>Date de début</label>
                    <input type="date"  className='custom-select' value={startDate} onChange={(e) => setStartDate(e.target.value)} /><br></br>
                    <label>Date de fin </label>
                    <input type="date"  className='custom-select'value={endDate} onChange={(e) => setEndDate(e.target.value)} />  <br></br>
                    <button className="button-colored" onClick={handleDateChange}>Filtrer</button>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            
            ) : selectedSalon && historique.length > 0 ? (
                <div>
                    <h2>Historique du salon {selectedSalon.name}</h2>
                    <div className="imp">
                    <p className="nb-visit">Nombre de visites: <span>{nombreVisites}</span></p>
                    <button onClick={handlePrintHistorique} className="button-colored">Imprimer l'historique</button>
                    
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Date</th>
                                <th>Fait par</th>
                                <th>Fiches</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historique.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.action}</td>
                                    <td>{new Date(entry.date.seconds * 1000).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</td>
                                    <td>{usersMap[entry.userId]?.lastname} {usersMap[entry.userId]?.firstname}</td>
                                    <td className="history-form">
                                        {renderFormData(entry.formData)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                selectedSalon && (
                    <div>
                        Aucun historique trouvé pour {selectedSalon.name}
                    </div>
                )
            )}
        </div>
    );
}

export default Historique 
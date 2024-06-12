
// fichier Historique.js

import back from "../assets/back.png"
import { useState } from "react"
import { db } from "../firebase.config"
import { query, collection, where, getDocs, getDoc, doc } from 'firebase/firestore'

function Historique({ onReturn }) {
    const [suggestions, setSuggestions] = useState([])
    const [searchSalon, setSearchSalon] = useState("")
    const [selectedSalon, setSelectedSalon] = useState(null)
    const [historique, setHistorique] = useState([])
    const [loading, setLoading] = useState(false)

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
                setHistorique(data.historique || [])
            } 
            else {
                setHistorique([])
            }
        } 
        catch (error) {
            console.error("Erreur lors de la récupération de l'historique du salon : ", error)
            setHistorique([])
        }
        setLoading(false)
    }

    const handlePrintHistorique = () => {
        window.print()
    }

    const renderFormData = (formData, userIdToNameMap) => {
        if (!formData) {
            return null;
        }
    
        // Fonction récursive pour rendre les champs de formData
        const renderFields = (data, prefix = '') => {
            return Object.entries(data).map(([key, value], index) => {
                const fieldName = prefix ? `${prefix}.${key}` : key;
                if (key === 'createdAt' || key === 'userId') {
                    return null; // Exclure les champs createdAt et userId
                } 
                else if (value && typeof value === 'object') {
                    const renderedFields = renderFields(value, fieldName);
                    return renderedFields.length ? (
                        <div key={fieldName}>
                            {renderedFields}
                        </div>
                    ) : null;
                } 
                else {
                    return value ? (
                        <div className="historique-formdata" key={fieldName}>
                           <thead><strong>{translateFieldName(fieldName)}</strong></thead> 
                           <tbody>{formatValue(fieldName, value, userIdToNameMap)}</tbody>
                             
                        </div>
                    ) : null;
                }
            });
        };
    
        // Fonction pour traduire les noms des champs
        const translateFieldName = (fieldName) => {
            switch (fieldName) {
                case 'salonName':
                    return 'Nom du salon';
                case 'city':
                    return 'Ville';
                case 'salonAdresse':
                    return 'Adresse';
                case 'salonTel':
                    return 'Numéro du salon';
                case 'tenueSalon':
                    return 'Tenue du salon';
                case 'tenuPar':
                    return 'Tenu par';
                case 'dept':
                    return 'Département';
                case 'responsableNom':
                    return 'Nom du responsable';
                case 'responsableNomPrenom':
                    return 'Nom du responsable';
                case 'responsableAge':
                    return 'Âge du responsable';
                case 'numeroPortable':
                    return 'N° du responsable';
                case 'responsablePortable':
                    return 'N° du responsable';
                case 'responsableEmail':
                    return 'E-mail du responsable';
                case 'adresseEmail':
                    return 'Adresse e-mail';
                case 'origineVisite':
                    return 'Origine de la visite';
                case 'colorationsAmmoniaque':
                    return 'Colorations avec ammoniaque';
                case 'colorationsSansAmmoniaque':
                    return 'Colorations sans ammoniaque';
                case 'colorationsVegetale':
                    return 'Colorations végétales';
                case 'autresMarques':
                    return 'Autres marques';
                case 'autresMarques.poudre':
                    return 'Autres marques / Poudre';
                case 'autresMarques.permanente':
                    return 'Autres marques / Permanente';
                case 'autresMarques.bac':
                    return 'Autres marques / BAC';
                case 'autresMarques.revente':
                    return 'Autres marques / Revente';
                case 'marquesEnPlace.systemeDsh':
                        return 'Marque en place / Système Dsh';
                case 'dateVisite':
                    return 'Date de visite';
                case 'equipe':
                    return 'Equipe';
                case 'clientEnContrat':
                    return 'Client en contrat';
                case 'contratLequel':
                    return 'Quel contrat';
                case 'tarifSpecifique':
                    return 'Tarif spécifique';
                case 'priseDeCommande':
                    return 'Prise de commande';
                case 'gammesCommande':
                    return 'Gammes commande';
                case 'responsablePresent':
                    return 'Responsable présent';
                case 'conceptsProposes':
                    return 'Concepts proposés';
                case 'animationProposee':
                    return 'Animation proposée';
                case 'produitsProposes':
                    return 'Produits proposés';
                case 'interessesPar':
                    return 'Intéressé par';
                case 'autresPoints':
                    return 'Autres points';
                case 'autresPointsAbordes':
                    return 'Autres points abordés';
                case 'statut':
                    return 'Statut';
                case 'rdvDate':
                    return 'RDV Date';
                case 'rdvPour':
                    return 'RDV Pour';
                case 'commande':
                    return 'Commande';
                case 'pointsProchaineVisite':
                    return 'Points pour la prochaine visite';
                case 'observations':
                    return 'Observations';
                case 'typeOfForm':
                    return 'Type de fiche';
                
                default:
                    return fieldName;
            }
        };
    
        // Fonction pour formater les valeurs des champs
        const formatValue = (fieldName, value, userIdToNameMap) => {
            if (fieldName === 'dateVisite' && value) {
                // Formater la date de visite
                return new Date(value).toLocaleDateString('fr-FR');
            } else if (fieldName === 'userId' && userIdToNameMap[value]) {
                // Remplacer l'ID utilisateur par son nom
                return userIdToNameMap[value];
            } else {
                return value;
            }
        };
    
        return renderFields(formData);
    };
    
    
    
    
    
    

    return (
        <div className="historique-section">
            <button onClick={onReturn} className="button-back">
                <img src={back} alt="retour" />
            </button>

            <div>
                <input type="text" placeholder="Rechercher un salon" value={searchSalon} onChange={handleSearch} />
                <div>
                    {suggestions.map((salon) => (
                        <div key={salon.id} onClick={() => handleSelectSuggestion(salon)}
                            style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ccc" }} >
                            {salon.name}
                        </div>
                    ))}
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            
            ) : selectedSalon && historique.length > 0 ? (
                <div>
                    <h2>Historique pour {selectedSalon.name}</h2>
                    <button onClick={handlePrintHistorique} className="button-colored">Imprimer l'historique</button>
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
                                    <td>{entry.userId}</td>
                                    <td className="formdata-table">{renderFormData(entry.formData)}</td>
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
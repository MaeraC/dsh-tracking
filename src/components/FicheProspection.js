
// Fichier FicheProspection.js

import { useState, useEffect } from "react"
import { doc, updateDoc, arrayUnion , getDoc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase.config.js"
import back from "../assets/back.png"
import { useNavigate } from "react-router-dom"

function FicheProspection({ uid, visitId }) {

    const navigate = useNavigate()
    const [message, setMessage] = useState("")
    const [savedData, setSavedData] = useState([])

    const [formData, setFormData] = useState({
        rdvObtenu: "",
        dateRdv: "",
        typeRdv: "",
        typeDemo: "",
        observation: ""
    })

    useEffect(() => {
        if (visitId) {

            const fetchData = async () => {
                try {
                    const visitDocRef = doc(db, "visits", visitId)
                    const visitSnapshot = await getDoc(visitDocRef)

                    if (visitSnapshot.exists()) {
                        const visitData = visitSnapshot.data()
                        
                        setFormData({
                            rdvObtenu: visitData.rdvObtenu || "",
                            dateRdv: visitData.dateRdv || "",
                            typeRdv: visitData.typeRdv || "",
                            typeDemo: visitData.typeDemo || "",
                            observation: visitData.observation || ""
                        })

                        if (visitData.dailyProspection) {
                            setSavedData(visitData.dailyProspection)
                        }
                    } 
                    else {
                        console.error("Cette feuille de visite n'existe pas / problème avec visitId")
                    }
                } catch (error) {
                    console.error("Erreur pour récupérer les données de la visite enregistrée: ", error)
                }
            }
            fetchData()

            // Ecoute les mises à jour en temps réel
            const unsubscribe = onSnapshot(doc(db, "visits", visitId), (doc) => {
                if (doc.exists()) {

                    const visitData = doc.data()

                    if (visitData.dailyProspection) {
                        setSavedData(visitData.dailyProspection)
                    }
                }
            })

            return () => unsubscribe()
        }
    }, [visitId])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (checked ? value : "") : value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newProspection = { ...formData, userId: uid }

        try {
            const visitDocRef = doc(db, "visits", visitId)
            
            await updateDoc(visitDocRef, {
                dailyProspection: arrayUnion(newProspection)
            })

            setMessage("Le formulaire est bien enregistré.")
        } 
        catch (error) {
            console.error("Erreur pour ajouter les informations de la fiche de prospection vers la visite enregistrée dans la base de données: ", error)
        }
    }

    return (
        <>
        <button onClick={() => navigate("/tableau-de-bord-commercial/questionnaires/")} className="button-v3 btn-back"><img src={back} alt="retourner à la liste des questionnaires" /></button>
                                
        <form onSubmit={handleSubmit} className="form-pj">
                                
        <div> 
            <label>RDV obtenu :</label> 
            <label>
                <input
                    type="radio"
                    name="rdvObtenu"
                    value="non"
                                            checked={formData.rdvObtenu === "non"}
                                            onChange={handleInputChange}
                                        />
                                        Non
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="rdvObtenu"
                                            value="oui"
                                            checked={formData.rdvObtenu === "oui"}
                                            onChange={handleInputChange}
                                        />
                                        Oui
                                    </label>
                                </div>
                                {formData.rdvObtenu === "non" && (
                                    <div>
                                        <label>Observation :</label>
                                        <input
                                            type="text"
                                            name="observation"
                                            value={formData.observation}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}
                                {formData.rdvObtenu === "oui" && (
                                    <>
                                        <div>
                                            <label>Date du RDV :</label>
                                            <input
                                                type="date"
                                                name="dateRdv"
                                                value={formData.dateRdv}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label>Type de RDV :</label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="typeRdv"
                                                    value="presentation"
                                                    checked={formData.typeRdv === "presentation"}
                                                    onChange={handleInputChange}
                                                />
                                                Présentation
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="typeRdv"
                                                    value="demonstration"
                                                    checked={formData.typeRdv === "demonstration"}
                                                    onChange={handleInputChange}
                                                />
                                                Démonstration
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="typeRdv"
                                                    value="autres"
                                                    checked={formData.typeRdv === "autres"}
                                                    onChange={handleInputChange}
                                                />
                                                Autres
                                            </label>
                                        </div>
                                        {formData.typeRdv === "demonstration" && (
                                            <div>
                                                <label>Type de démonstration :</label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="typeDemo"
                                                        value="mic"
                                                        checked={formData.typeDemo === "Mic"}
                                                        onChange={handleInputChange}
                                                    />
                                                    Mic
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="typeDemo"
                                                        value="col_th"
                                                        checked={formData.typeDemo === "Coloration Thalasso"}
                                                        onChange={handleInputChange}
                                                    />
                                                    Coloration Thalasso
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="typeDemo"
                                                        value="vege"
                                                        checked={formData.typeDemo === "La Végétale"}
                                                        onChange={handleInputChange}
                                                    />
                                                    La Végétale
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="typeDemo"
                                                        value="dec_per_by_dsh"
                                                        checked={formData.typeDemo === "Dec/per"}
                                                        onChange={handleInputChange}
                                                    />
                                                    Déc/per
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="typeDemo"
                                                        value="dec_per_by_dsh"
                                                        checked={formData.typeDemo === "By DSH"}
                                                        onChange={handleInputChange}
                                                    />
                                                    By DSH
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="typeDemo"
                                                        value="olyz"
                                                        checked={formData.typeDemo === "Olyzea"}
                                                        onChange={handleInputChange}
                                                    />
                                                    Olyzea
                                                </label>
                                            </div>
                                        )}
                                        {formData.typeRdv === "autres" && (
                                            <div>
                                                <label>Précisez :</label>
                                                <input
                                                    type="text"
                                                    name="observation"
                                                    value={formData.observation}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                                <button type="submit" className="button">Soumettre</button>
                                <p className="message">{message}</p>
                    
                                <div className="saved-data">
                                    <h3>Données sauvegardées :</h3>
                    
                                    {savedData.map((data, index) => (
                                        <div key={index}>
                                            <p><span>RDV obtenu</span> : {data.rdvObtenu}</p>
                    
                                            {data.rdvObtenu === "oui" && (
                                                <div>
                                                    <p><span>Date du RDV</span> : {data.dateRdv}</p>
                                                    <p><span>Type de RDV</span> : {data.typeRdv}</p>
                                                    {data.typeRdv === "demonstration" && (
                                                        <p><span>Type de démonstration</span> : {data.typeDemo}</p>
                                                    )}
                                                    {data.typeRdv === "autres" && (
                                                        <p><span>Observation</span> : {data.observation}</p>
                                                    )}
                                                </div>
                                            )}
                                            {data.rdvObtenu === "non" && (
                                                <p><span>Observation</span> : {data.observation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </form>
        </>
        
    );
}

export default FicheProspection;

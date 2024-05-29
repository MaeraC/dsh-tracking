
// Fichier FicheProspection.js

import { useState, useEffect } from "react"
import { doc, updateDoc, arrayUnion , getDoc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase.config.js"
import { useNavigate } from "react-router-dom"
import back from "../assets/back.png"

function FicheProspection({ uid, visitId }) {

    const navigate = useNavigate()

    const [message, setMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
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

        if (!formData.rdvObtenu || (formData.rdvObtenu === "Oui" && (!formData.dateRdv || !formData.typeRdv)) || (formData.rdvObtenu === "Non" && !formData.observation)) {
            setErrorMessage("Veuillez remplir tous les champs requis.")
            return
        } 
        else {
            setErrorMessage("")
        }

        const createdAt = new Date()

        const newProspection = { 
            ...formData, 
            userId: uid, 
            createdAt: createdAt
        }

        try {
            const visitDocRef = doc(db, "visits", visitId)
            
            await updateDoc(visitDocRef, {
                dailyProspection: arrayUnion(newProspection)
            })

            setMessage("Le formulaire est bien enregistré.")

            if (newProspection.typeRdv === "Démonstration") {
                await updateDoc(visitDocRef, {
                    crDemonstration: []  
                })
            }
            if (newProspection.typeRdv === "Présentation") {
                await updateDoc(visitDocRef, {
                    crPresentation: []  
                })
            }
        } 
        catch (error) {
            console.error("Erreur pour ajouter les informations de la fiche de prospection vers la visite enregistrée dans la base de données: ", error)
        }
    }

    const handleBackClick = () => {
        navigate("/tableau-de-bord-commercial/questionnaires");
        window.location.reload()
    }

    return (
        <>
        <button onClick={handleBackClick} className="button-back"><img src={back} alt="retour" /></button>
            
        <form onSubmit={handleSubmit} className="form-pj">
                                
            <div> 
                <label><strong>RDV obtenu </strong>:</label> 
                <label><input className="checkbox" type="radio" name="rdvObtenu" value="Non" checked={formData.rdvObtenu === "Non"} onChange={handleInputChange} />Non</label>
                <label><input className="checkbox" type="radio" name="rdvObtenu" value="Oui" checked={formData.rdvObtenu === "Oui"} onChange={handleInputChange}/>Oui</label>
            </div>
            <br></br>

            {formData.rdvObtenu === "Non" && (
                <div>
                    <label><strong>Observation</strong> :</label>
                    <input type="text" name="observation" placeholder="Ecrivez ici vos observations" value={formData.observation} onChange={handleInputChange} />
                </div>
            )}

        {formData.rdvObtenu === "Oui" && (
        <>
        <div className="date">
            <label><strong>Date du RDV</strong> :</label>
            <input type="date" name="dateRdv" value={formData.dateRdv} onChange={handleInputChange} />
        </div>
        <br></br>

        <div>
            <label><strong>Type de RDV</strong> :</label><br></br>
            <label><input className="checkbox" type="checkbox" name="typeRdv" value="Présentation" checked={formData.typeRdv === "Présentation"} onChange={handleInputChange} />Présentation</label><br></br>
            <label><input className="checkbox" type="checkbox" name="typeRdv" value="Démonstration" checked={formData.typeRdv === "Démonstration"} onChange={handleInputChange} />Démonstration</label><br></br>
            <label><input className="checkbox" type="checkbox" name="typeRdv" value="Autre" checked={formData.typeRdv === "Autre"} onChange={handleInputChange} />Autre</label>
        </div>
        <br></br>

            {formData.typeRdv === "Démonstration" && (
            <>
            <div>
                <label><strong>Type de démonstration</strong> :</label><br></br>
                <label><input className="checkbox" type="checkbox" name="typeDemo" value="Microscopie" checked={formData.typeDemo === "Microscopie"} onChange={handleInputChange} />Microscopie</label><br></br>
                <label><input className="checkbox" type="checkbox" name="typeDemo" value="Coloration Thalasso" checked={formData.typeDemo === "Coloration Thalasso"} onChange={handleInputChange} />Coloration Thalasso</label><br></br>
                <label><input className="checkbox" type="checkbox" name="typeDemo" value="La Végétale" checked={formData.typeDemo === "La Végétale"} onChange={handleInputChange} />La Végétale</label><br></br>
                <label><input type="checkbox" className="checkbox" name="typeDemo" value="Dec/per" checked={formData.typeDemo === "Dec/per"} onChange={handleInputChange} />Déc/per</label><br></br>
                <label><input type="checkbox" className="checkbox" name="typeDemo" value="By Dsh" checked={formData.typeDemo === "By DSH"} onChange={handleInputChange} />By DSH</label><br></br>
                <label><input type="checkbox" className="checkbox" name="typeDemo" value="Olyzea" checked={formData.typeDemo === "Olyzea"} onChange={handleInputChange} />Olyzea</label>
            </div>
            <br></br>
            </>
            )}

            {formData.typeRdv === "Autre" && (
                <div>
                    <label><strong>Précisez</strong> :</label>
                    <input type="text" name="observation" value={formData.observation} onChange={handleInputChange} />
                </div>
            )}
        </>
        )}

        <button type="submit" className="button-fpj">Valider</button>
        <p className="message">{message}</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    
        <div className="saved-data">
        {savedData.map((data, index) => (
            <div className="div" key={index}>
                <p><span>RDV obtenu</span> : {data.rdvObtenu}</p>
                    
                {data.rdvObtenu === "Oui" && (
                    <div>
                        <p><span>Date du RDV</span> : {data.dateRdv}</p>
                        <p><span>Type de RDV</span> : {data.typeRdv}</p>

                        {data.typeRdv === "Démonstration" && (
                            <p><span>Type de démonstration</span> : {data.typeDemo}</p>
                        )}
                        {data.typeRdv === "Autre" && (
                            <p><span>Observation</span> : {data.observation}</p>
                        )}
                    </div>
                )}
                {data.rdvObtenu === "Non" && (
                    <p><span>Observation</span> : {data.observation}</p>
                )}
            </div>
        ))}
        </div>
    </form>
        </>
        
    )
}

export default FicheProspection

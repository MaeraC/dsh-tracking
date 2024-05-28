
// fichier FDRSemaine 

import { useState, useEffect, useCallback } from "react"
import { startOfWeek, endOfWeek, format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { addDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase.config.js"
import FicheProspection from "./FicheProspection"
import FicheSuiviClients from "./FicheSuiviClients"
import FicheSuiviProspects from "./FicheSuiviProspects"
import CRDemonstration from "./CRDemonstration.js"
import CRPresentation from "./CRPresentation.js"

function FDRSemaine({ uid }) {

    const navigate = useNavigate()
    
    const [visits, setVisits] = useState([]) 
    const [detectedDate, setDetectedDate] = useState('') 
    const [showVisits, setShowVisits] = useState(false)  
    const [showProspectionForm, setShowProspectionForm] = useState(false)
    const [showFicheSuiviClient, setshowFicheSuiviClient] = useState(false)
    const [showFicheSuiviProspect, setshowFicheSuiviProspect] = useState(false)
    const [currentVisitId, setCurrentVisitId] = useState(null)
    const [showCRDemonstration, setShowCRDemonstration] = useState(false)
    const [showCRPresentation, setShowCRPresentation] = useState(false)

    const [visitInfo, setVisitInfo] = useState({
        salonName: "",
        status: "",
        city: "",
        km: "",
    })

    const fetchVisits = useCallback(async () => {
        const visitsRef = collection(db, "visits") // repère la collection des visites enregistreées
        const q = query(visitsRef, where("userId", "==", uid)) // qui correspond au user connecté
        const querySnapshot = await getDocs(q)
        const visitsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        //console.log(visits)
        setVisits(visitsData)

    }, [uid])
    
    useEffect(() => {
        if (showVisits) {
            fetchVisits()
        }

    }, [showVisits, fetchVisits])

    // Gestion de saisie des inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setVisitInfo({ ...visitInfo, [name]: value })
    } 

    // Ajout des visites dans la base de données 
    const handleAddVisit = async () => {

        const currentDay = new Date()
        const dayOfWeek = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
        const currentDayOfWeek = dayOfWeek[currentDay.getDay()]
        let timeOfDay = ''

        if (currentDay.getHours() < 12) {
            timeOfDay = 'matin'
        } 
        else if (currentDay.getHours() < 18) { 
            timeOfDay = 'après-midi'
        } 
        else {
            timeOfDay = 'soir'
        }

        const detectedDate = `${currentDayOfWeek} ${timeOfDay}`
        const startOfWeekDate = startOfWeek(currentDay, { weekStartsOn: 1 })
        const endOfWeekDate = endOfWeek(currentDay, { weekStartsOn: 1 })
        const weekLabel = `${format(startOfWeekDate, 'dd MMM yyyy')} - ${format(endOfWeekDate, 'dd MMM yyyy')}`

        const day = String(currentDay.getDate()).padStart(2, '0');
        const month = String(currentDay.getMonth() + 1).padStart(2, '0');
        const year = currentDay.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;


        const newVisit = { 
            salonName: visitInfo.salonName, 
            status: visitInfo.status, 
            city: visitInfo.city, 
            detectedDate, 
            exactDate: formattedDate, 
            week: weekLabel, 
            userId: uid,
            dailyProspection: []
        }

        try {
            const docRef = await addDoc(collection(db, "visits"), newVisit)
            const newVisitWithId = { ...newVisit, id: docRef.id }

            setVisits([...visits, newVisitWithId])
            setCurrentVisitId(docRef.id)

            setVisitInfo({
                salonName: "",
                status: "",
                city: "",
                km: "",
            })
        } catch (error) {
            console.error("Erreur lors de l'ajout de la visite :", error)
        }
    }

    // Détecte la date actuelle
    const handleDetectDate = () => {
        const currentDate = new Date();
        const dayOfWeek = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
        const currentDay = dayOfWeek[currentDate.getDay()]
        let timeOfDay = ''
    
        if (currentDate.getHours() < 12) {
            timeOfDay = 'matin'
        } 
        else if (currentDate.getHours() < 18) {
            timeOfDay = 'après-midi'
        } 
        else {
            timeOfDay = 'soir'
        }
    
        const detectedDate = `${currentDay} ${timeOfDay}`;
        setDetectedDate(detectedDate);
    }    
    
    const handleShowProspectionForm = (visitId) => {
        setCurrentVisitId(visitId)
        setShowProspectionForm(true)
        setShowVisits(false)

        if (visitId) {
            navigate(`fiche-prospection/${visitId}`)
        } 
        else {
            console.error("visitId est undefined.")
        }
    }

    const handleShowFicheSuiviProspect = (visitId) => {
        setCurrentVisitId(visitId)
        setshowFicheSuiviProspect(true)
        setShowVisits(false)
        navigate(`fiche-suivi-prospect/${visitId}`)
    }

    const handleShowFicheSuiviClient = (visitId) => {
        setCurrentVisitId(visitId)
        setshowFicheSuiviClient(true)
        setShowVisits(false)
        navigate(`fiche-suivi-client/${visitId}`)
    }

    const handleShowCRDemonstration = (visitId) => {
        setCurrentVisitId(visitId)
        setShowCRDemonstration(true)
        setShowVisits(false)
        navigate(`cr-demonstration/${visitId}`)
    }

    const handleShowCRPresentation = (visitId) => {
        setCurrentVisitId(visitId)
        setShowCRPresentation(true)
        setShowVisits(false)
        navigate(`cr-presentation/${visitId}`)
    }
    

    return (
            <div className="fdr">
                <h2>Feuille de route de la semaine écoulée</h2>

                {showVisits ? (
                    <div className="fdr-saved">
                        <button onClick={() => setShowVisits(false)} className="button-colored">Retour à la Feuille de Route</button>

                        {visits.map((visit, index) => (
                            <div className="visit-saved" key={index}>
                                <p><span>Nom du salon</span> : {visit.salonName}</p>
                                <p><span>Status</span> : {visit.status}</p>
                                <p><span>Ville</span> : {visit.city}</p>
                                <p><span>Date exacte</span> : {visit.exactDate}</p>
                                <p><span>Date détectée</span> : {visit.detectedDate}</p>
                                <p><span>Semaine</span> : {visit.week}</p>

                                <button onClick={() => handleShowProspectionForm(visit.id)} className="button-fpj">Fiche de prospection journalière</button>

                                {visit.status === "prospect" && (
                                <button onClick={() => handleShowFicheSuiviProspect(visit.id)} className="button-fsp">Fiche de suivi prospect</button>
                                )}
                                {visit.status === "client" && (
                                    <button onClick={() => handleShowFicheSuiviClient(visit.id)} className="button-fsc">Fiche de suivi client</button>
                                )}
                                {visit.dailyProspection && visit.dailyProspection.some(prospection => prospection.typeRdv === "demonstration") && (
                                    <button onClick={() => handleShowCRDemonstration(visit.id)} className="button-colored">Compte Rendu de RDV de Démonstration</button>
                                )}
                                {visit.dailyProspection && visit.dailyProspection.some(prospection => prospection.typeRdv === "presentation") && (
                                    <button onClick={() => handleShowCRPresentation(visit.id)} className="button-colored">Compte Rendu de RDV de Présentation</button>
                                )}

                            </div>
                        ))}
                        
                    </div>
                ) : showProspectionForm && currentVisitId ? (
                    <FicheProspection visitId={currentVisitId} uid={uid} />
                
                ) : showFicheSuiviClient && currentVisitId ? (
                    <FicheSuiviClients visitId={currentVisitId} uid={uid} />

                ) : showFicheSuiviProspect && currentVisitId ? (
                    <FicheSuiviProspects visitId={currentVisitId} uid={uid} />

                ) : showCRDemonstration && currentVisitId ? (
                    <CRDemonstration visitId={currentVisitId} uid={uid} />

                ) : showCRPresentation && currentVisitId ? (
                    <CRPresentation visitId={currentVisitId} uid={uid} />
                ) : (
                    <>
                        <div className="fdr-header">    
                            <button onClick={() => setShowVisits(true)} className="button-colored">Afficher les visites enregistrées</button>
                        </div>

                        <div className="fdr-survey">
                            <div className="fdr-info">
                                <div className="fdr-info">
                                    <input 
                                        type="text" 
                                        name="salonName" 
                                        value={visitInfo.salonName}  
                                        onChange={handleInputChange} 
                                        placeholder="Nom du salon" 
                                    />
                                    <select name="status" value={visitInfo.status} onChange={handleInputChange}>
                                        <option value="">Status Prospect ou Client</option>
                                        <option value="client">Client</option>
                                        <option value="prospect">Prospect</option>
                                    </select>
                                    <input 
                                        type="text"  
                                        name="city" 
                                        value={visitInfo.city} 
                                        onChange={handleInputChange} 
                                        placeholder="Ville géolocalisée" 
                                    />
                                    <input 
                                        type="number" 
                                        name="km" 
                                        value={visitInfo.kilometers} 
                                        onChange={handleInputChange} 
                                        placeholder="Kilomètres parcourus"  
                                    />
                                    <div className="fdr-date">
                                        <button className="button-colored" onClick={handleDetectDate}>Detecter la date</button>
                                        <input 
                                            type="text" 
                                            value={detectedDate} 
                                            onChange={(e) => setDetectedDate(e.target.value)} 
                                            placeholder="Date détectée" 
                                            className="btn-date"
                                        />
                                    </div> 
                                    <button onClick={handleAddVisit} className="button-colored">Valider la visite</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                
            </div>
    )
}

export default FDRSemaine  

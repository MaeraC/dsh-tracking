
// fichier SearchFeuillesDuJourCom.js

import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../firebase.config'

function SearchFeuillesDuJourCom({ uid }) {
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showResults, setShowResults] = useState(false); 
    const [nombreVisites, setNombreVisites] = useState(0);
    const [nombreVisitesClient, setNombreVisitesClient] = useState(0);
    const [nombreVisitesProspect, setNombreVisitesProspect] = useState(0);

    useEffect(() => {
        if (!uid || !startDate || !endDate) {
            setFeuillesDeRoute([]);
            setNombreVisites(0);
            setNombreVisitesClient(0);
            setNombreVisitesProspect(0);
            return;
        }

        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            const startTimestamp = Timestamp.fromDate(new Date(startDate));
            const endTimestamp = Timestamp.fromDate(new Date(endDate)); 
            const q = query(feuillesDeRouteRef, 
                where('userId', '==', uid),
                where('date', '>=', startTimestamp),
                where('date', '<=', endTimestamp)
            )
    
            try {
                const querySnapshot = await getDocs(q) 
                
                if (!querySnapshot.empty) {
                    const feuilles = querySnapshot.docs.map(doc => doc.data());
                    setFeuillesDeRoute(feuilles)
                    calculateVisites(feuilles);
                } else {
                    setFeuillesDeRoute([])
                    setNombreVisites(0);
                    setNombreVisitesClient(0);
                    setNombreVisitesProspect(0);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des feuilles de route : ", error);
            }
        };
    
        fetchFeuillesDeRoute();
        // eslint-disable-next-line
    }, [uid, startDate, endDate, showResults])

    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return ''; 
        }
        const dateObject = timestamp.toDate();
        return dateObject.toLocaleDateString(); 
    };

    const getNombreDeVisites = (stops) => {
        return stops.length > 1 ? stops.length - 1 : 0
    }

    const countVisitesByStatus = (stops, status) => {
        return stops.filter(stop => stop.status === status).length 
    }

    const calculateVisites = (feuilles) => {
        let totalVisites = 0;
        let totalVisitesClient = 0;
        let totalVisitesProspect = 0;

        feuilles.forEach(feuille => {
            const stops = feuille.stops || [];
            totalVisites += stops.length > 1 ? stops.length - 1 : 0;

            totalVisitesClient += stops.filter(stop => stop.status === 'Client').length;
            totalVisitesProspect += stops.filter(stop => stop.status === 'Prospect').length;
        });

        setNombreVisites(totalVisites);
        setNombreVisitesClient(totalVisitesClient);
        setNombreVisitesProspect(totalVisitesProspect);
    };

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }

    const handleStartDateChange = (event) => {
        const { value } = event.target;
        setStartDate(value);
    };

    const handleEndDateChange = (event) => {
        const { value } = event.target;
        setEndDate(value);
    };

    const handleSubmit = () => {
        setShowResults(true); 
    };

    return (
        <div className='filter-feuilles' style={{marginTop: "30px", width: "65%", padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center"}}>    
            <div className='filters' style={{width: "70%"}}>
                <label className='label'>Date de début :</label>
                <input type="date" value={startDate} onChange={handleStartDateChange} />

                <label className='label'>Date de fin :</label>
                <input type="date" value={endDate} onChange={handleEndDateChange} />

                <button className='button-colored' onClick={handleSubmit}>Valider</button>
            </div>

            {showResults && (
                <div className='filter-feuilles-stats'>
                    <p><strong>Nombre de visites</strong><span>{nombreVisites}</span></p>
                    <p><strong>Visites client</strong><span>{nombreVisitesClient}</span></p>
                    <p><strong>Visites prospect</strong><span>{nombreVisitesProspect}</span></p>
                </div>
            )}
 
            {showResults && feuillesDeRoute.length > 0 && (
                <div style={{ width: "100%", padding: "20px", display: "flex", flexWrap: "wrap" , justifyContent: "center", }} >   
                {feuillesDeRoute.map((feuille, index) => (
                    <div className='feuille-du-jour feuille-this-filter' key={index} style={{background: "#DCF1F2", width: "45%", padding: "20px", borderRadius: "20px", margin: "20px"}} >  
                    
                        <h3 style={{textAlign: "center", marginBottom: "20px"}}>Feuille du {feuille.date ? formatTimestamp(feuille.date) : "Date non disponible"}</h3>
                        
                        {feuille.stops && feuille.stops.map((stop, idx) => (
                            <>
                            {idx < feuille.stops.length - 1 ? (
                                <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px" }}><strong>Visite n°{idx + 1}</strong></p>
                            ) : (
                                <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px" }}><strong>Retour</strong></p>
                            )}
                            <div className='visites' key={idx}>
                            {stop.name && (
                                    <div>
                                        <p className='titre'>Nom</p>
                                        <p className='texte'>{stop.name}</p>
                                    </div>
                                )}
                                {stop.status && (
                                    <div>
                                        <p className='titre'>Statut</p>
                                        <p className='texte'>{stop.status}</p>
                                    </div>
                                )}
                                {stop.address && (
                                    <div>
                                        <p className='titre'>Adresse</p>
                                        <p className='texte'>{stop.address}</p>
                                    </div>
                                )}
                                {stop.postalCode && stop.city && (
                                    <div>
                                        <p className='titre'>Ville</p>
                                        <p className='texte'>{stop.postalCode} {stop.city}</p>
                                    </div>
                                )}
                                {stop.distance !== undefined && (
                                    <div>
                                        <p className='titre'>Km parcourus</p>
                                        <p className='texte'>{formatDistance(stop.distance)}</p>
                                    </div>
                                )}
                                {stop.arrivalTime && (
                                    <div>
                                        <p className='titre'>Heure d'arrivée</p>
                                        <p className='texte'>{stop.arrivalTime}</p>
                                    </div>
                                )}
                                {stop.departureTime && (
                                    <div>
                                        <p className='titre'>Heure de départ</p>
                                        <p className='texte'>{stop.departureTime}</p>
                                    </div>
                                )}
                            </div>
                            </>
                        ))}

                        <p style={{ marginTop: "20px" }}><strong>Total de la distance parcourue </strong>: {formatDistance(feuille.totalKm)}</p>
                        <p style={{ marginTop: "5px" }}><strong>Total des visites effectuées </strong>: {getNombreDeVisites(feuille.stops || [])}</p>
                        <p style={{ marginTop: "5px" }}><strong>Visites client </strong>: {countVisitesByStatus(feuille.stops || [], 'Client')}</p>
                        <p style={{ marginTop: "5px" }}><strong>Visites prospect </strong>: {countVisitesByStatus(feuille.stops || [], 'Prospect')}</p>
                        <p style={{ marginTop: "20px" }}>Validé le {feuille.signatureDate}</p>
                    </div>
                   
                ))} 
                </div>
            )}
        </div>
    )
}

export default SearchFeuillesDuJourCom



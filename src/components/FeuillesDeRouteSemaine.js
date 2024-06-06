
// fichier FeuillesDeRouteSemaine.js

import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'
import back from "../assets/back.png"

function FeuillesDeRouteSemaine({ uid, onReturn }) {

    const [feuillesDeRoute, setFeuillesDeRoute] = useState([])
    const [filteredFeuillesDeRoute, setFilteredFeuillesDeRoute] = useState([])
    const [selectedPeriod, setSelectedPeriod] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isThisWeekOpen, setisThisWeekOpen] = useState(false)
    const [feuilleDuJour, setFeuilleDuJour] = useState(null)
    const [isFeuilleDuJourOpen, setIsFeuilleDuJourOpen] = useState(false)
    const [isFicheCloturee, setIsFicheCloturee] = useState(false)

    // récupère toutes les feuilles de route du user
    useEffect(() => {
        if (!uid) return

        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute')
            const q = query(feuillesDeRouteRef, where('userId', '==', uid), orderBy('date'))
            const querySnapshot = await getDocs(q)

            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(), 
            }))

            setFeuillesDeRoute(feuillesDeRouteData)
        }

        fetchFeuillesDeRoute()
    }, [uid])

    // configure la semaine en cours 
    const getWeek = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    }

    // affiche la feuille de route de la semaine en cours
    const displayThisWeek = () => {
        setisThisWeekOpen(true)

        const today = new Date()
        const currentWeek = getWeek(today)

        const filtered = feuillesDeRoute.filter(feuille => {
            if (!feuille.date) {
                return false;
            }
            const feuilleDate = new Date(feuille.date.seconds * 1000)
            const feuilleWeek = getWeek(feuilleDate)
            return feuilleWeek === currentWeek
        })

        setFilteredFeuillesDeRoute(filtered)
    }

    // nouveau format
    const formatDate = (date) => {
        if (!date || !date.seconds) {
            return 'Date non disponible';
        }
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

        const d = new Date(date.seconds * 1000)
        const dayName = days[d.getUTCDay()]
        const day = d.getUTCDate()
        const month = months[d.getUTCMonth()]
        const year = d.getUTCFullYear()

        return `${dayName} ${day} ${month} ${year}`
    }

    // affiche la periode sélectionnée 
    const handleApplyDates = () => {
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const filtered = feuillesDeRoute.filter(feuille => {
                if (!feuille.date) {
                    return false;
                }
                const feuilleDate = new Date(feuille.date.seconds * 1000)
                console.log('Feuille Date:', feuilleDate);
                return feuilleDate >= start && feuilleDate <= end
            })

            setSelectedPeriod(filtered)
        }
    }

    const handleCloturerFiche = async (e) => {
        e.preventDefault()

        if (feuilleDuJour) {
            const feuilleRef = doc(db, 'feuillesDeRoute', feuilleDuJour.id)
            await updateDoc(feuilleRef, { ...feuilleDuJour, isClotured: true })
            setIsFicheCloturee(true);
        }
    }

    const displayFeuilleDuJour = () => {
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
        const feuille = feuillesDeRoute.find(feuille => {
            if (!feuille.date) {
                return false;
            }
            const feuilleDate = new Date(feuille.date.seconds * 1000).toISOString().split('T')[0];
            console.log(feuilleDate === todayDate)
            return feuilleDate === todayDate;
        });
    
        setFeuilleDuJour(feuille || null)  
        console.log(feuilleDuJour)
        setIsFeuilleDuJourOpen(true) 
    }

    useEffect(() => {
        if (feuilleDuJour) {
            setIsFicheCloturee(feuilleDuJour.isClotured || false);
        }
    }, [feuilleDuJour]);
    

    return (
        <div className="feuilles-de-route-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header> 
                <h1>Feuilles de route de la semaine</h1>
            </header>

            <div>
                <label>Date de début</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                
                <label>Date de fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />  

                <button className='button-colored' onClick={handleApplyDates}>Appliquer</button>  
            </div>

            <button onClick={displayThisWeek}>Feuille de route de la semaine en cours</button>

            <button onClick={displayFeuilleDuJour}>Feuille de route du jour</button>

            {selectedPeriod.length > 0 && (
                <div>
                    <h2>Feuilles de route pour la période sélectionnée :</h2>
                    {selectedPeriod.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p>Date: {formatDate(feuille.date)}</p>
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p>Ville: {feuille.city}</p>
                                    <p>Adresse de départ: {feuille.departureAddress}</p>
                                    <p>Distance totale: {feuille.totalDistance} km</p>
                                    <ul>
                                        {feuille.stops.map((stop, index) => (
                                            <li key={index}>{stop.name} - {stop.distance} km</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées: {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite: {feuille.motifNoVisits}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
 
            {isThisWeekOpen && (
                <div>
                    <h2>Semaine en cours</h2>
                    {filteredFeuillesDeRoute.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p>Date: {formatDate(feuille.date)}</p>
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p>Ville: {feuille.city}</p>
                                    <p>Adresse de départ: {feuille.departureAddress}</p>
                                    <p>Distance totale: {feuille.totalDistance} km</p>
                                    <ul> 
                                        {feuille.stops.map((stop, index) => (
                                            <li key={index}>{stop.name} - {stop.distance} km</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées: {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite: {feuille.motifNoVisits}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}


            {isFeuilleDuJourOpen && (
                <div>
                    <h2>FDR du {formatDate(feuilleDuJour.date)}</h2>
                    {feuilleDuJour ? (
                        <>
                            {isFicheCloturee ? (
                                <div>
                                    <h3>Informations clôturées :</h3>
                                    <p>Ville : {feuilleDuJour.city}</p>
                                    <p>Adresse de départ : {feuilleDuJour.departureAddress}</p>
                                    <p>Distance totale : {feuilleDuJour.totalDistance} km</p>
                                    <h4>Arrêts :</h4>
                                    {feuilleDuJour.stops.map((stop, index) => (
                                        <div key={index}>
                                            <p>Nom de l'arrêt : {stop.name}</p>
                                            <p>Distance : {stop.distance} km</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <form onSubmit={handleCloturerFiche}>   
                                    <label>Ville</label>
                                    <input type="text" value={feuilleDuJour.city} onChange={(e) => setFeuilleDuJour({...feuilleDuJour, city: e.target.value})} />
                                    
                                    <label>Adresse de départ</label>
                                    <input type="text" value={feuilleDuJour.departureAddress} onChange={(e) => setFeuilleDuJour({...feuilleDuJour, departureAddress: e.target.value})}/>
                                    
                                    <label>Distance totale</label>
                                    <p>{feuilleDuJour.totalDistance} km</p>
                                    
                                    {feuilleDuJour.stops.map((stop, index) => (
                                        <div key={index}>
                                            <label>Nom de l'arrêt</label>
                                            <input type="text" value={stop.name} 
                                                onChange={(e) => {
                                                    const newStops = [...feuilleDuJour.stops];
                                                    newStops[index].name = e.target.value;
                                                    setFeuilleDuJour({...feuilleDuJour, stops: newStops});
                                                }}
                                            />
                                            <label>Distance</label>
                                            <p>{stop.distance} km</p>
                                        </div>
                                    ))}
                                    
                                    <button type="submit" onClick={handleCloturerFiche}>Clôturer la fiche</button>
                                </form>
                            )}
                        </>
                    ) : (
                        <p>Aucune feuille de route trouvée pour aujourd'hui.</p>
                    )}
                </div>
            )}



        </div>
    );
}

export default FeuillesDeRouteSemaine
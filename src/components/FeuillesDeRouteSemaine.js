
// fichier FeuillesDeRouteSemaine.js

import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase.config'
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'
import back from "../assets/back.png"
import close from "../assets/close.png"
import ReactSignatureCanvas from 'react-signature-canvas'

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
    const [status, setStatus] = useState('')
    const [showSignButton, setShowSignButton] = useState(false)
    const [confirmNoVisit, setConfirmNoVisit] = useState(false)
    const [otherMotif, setOtherMotif] = useState('')
    const [isSignatureDone, setIsSignatureDone] = useState(false)
    const [isSelectedPeriodShown, setIsSelectedPeriodShown] = useState(false)

    const signatureCanvasRef = useRef() 

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

    // Vérifie si on est vendredi 18h 
    useEffect(() => {
        const currentDate = new Date()
        const isFridayAfterSix = currentDate.getDay() === 6 && currentDate.getHours() >= 8;
        setShowSignButton(isFridayAfterSix)
    }, [])

    useEffect(() => {
        if (feuilleDuJour) {
            setIsFicheCloturee(feuilleDuJour.isClotured || false);
        }
    }, [feuilleDuJour])

    // configure la semaine 
    const getWeek = (date) => {
        const dayOfWeek = date.getDay(); // 0 pour dimanche, 1 pour lundi, ..., 6 pour samedi
        const firstDayOfWeek = new Date(date); // Clone la date pour ne pas modifier l'original
        firstDayOfWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Réglez le premier jour de la semaine à lundi
        const onejan = new Date(firstDayOfWeek.getFullYear(), 0, 1); // Premier jour de l'année
        const week = Math.ceil((((firstDayOfWeek - onejan) / 86400000) + onejan.getDay() + 1) / 7); // Calcul du numéro de semaine
        return week;
    }
    
    // affiche la feuille de route de la semaine en cours
    const displayThisWeek = () => {
        setisThisWeekOpen(true)

        const today = new Date()
        const currentWeek = getWeek(today)

        const filtered = feuillesDeRoute.filter(feuille => {

            if (!feuille.date) {
                return false
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

    // affiche les fiches la periode sélectionnée 
    const handleApplyDates = () => {
        setIsSelectedPeriodShown(true)

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
            await updateDoc(feuilleRef, { ...feuilleDuJour, isClotured: true, status: status })
            setIsFicheCloturee(true)
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
        setIsFeuilleDuJourOpen(true) 
    }

    /*
    const handleSignFiche = async () => {
        // Vérifier si la signature a été faite
        if (!signatureCanvasRef.current.isEmpty()) {
            // Enregistrer la feuille de route de la semaine
            const fdrSemaineRef = collection(db, 'fdrSemaine');
            await addDoc(fdrSemaineRef, {
                userId: uid,
                dayOn: filteredFeuillesDeRoute.filter(feuille => feuille.isVisitsStarted),
                dayOff: filteredFeuillesDeRoute.filter(feuille => !feuille.isVisitsStarted),
                signature: signatureCanvasRef.current.getTrimmedCanvas().toDataURL('image/png'),
                dateSignature: new Date(),
            });

            // Masquer la feuille de route de la semaine
            setisThisWeekOpen(false);
        }
    }*/

    //handleSignFiche() 

    return (
        <div className="feuilles-de-route-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header> 
                <h1>Feuilles de route de la semaine</h1>
            </header>

            <div className='search'>
                <label>Date de début</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                
                <label>Date de fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />  

                <button className='button-colored' onClick={handleApplyDates}>Appliquer</button>  
            </div>

            <button className='button-colored' onClick={displayThisWeek}>Feuille de route de la semaine en cours</button>

            <button className='button-colored' onClick={displayFeuilleDuJour}>Feuille de route du jour</button>

            {selectedPeriod.length > 0 && isSelectedPeriodShown === true && (
                <div className='selected-period'>
                    <h2>Feuilles de route pour la période sélectionnée :</h2>
                    <button className='close-btn' onClick={() => setIsSelectedPeriodShown(false)} >
                       <img src={close} alt="fermer" /> 
                    </button> 
                    {selectedPeriod.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p>
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
                <div className='this-week'>
                    <button className='close-btn' onClick={() => setisThisWeekOpen(false)} >
                       <img src={close} alt="fermer" /> 
                    </button> 
                    <h2>Feuille de route de la semaine en cours</h2>

                    {showSignButton && (
                        <div>
                            <button onClick={() => setIsSignatureDone(true)}>Signer la feuille de route</button>
                            {isSignatureDone && (
                                <div className="signature-modal">
                                    <ReactSignatureCanvas ref={signatureCanvasRef} canvasProps={{ width: 400, height: 200, className: 'sigCanvas' }} />
                                    <button onClick={() => setIsSignatureDone(false)}>Annuler</button>
                                </div>
                            )}
                        </div>
                    )}

                    {filteredFeuillesDeRoute.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p>
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

                                    {confirmNoVisit ? (
                                        <div>
                                            <p>Confirmez-vous ne pas avoir effectué de déplacements ce jour là ?</p>
                                            <div>
                                                <label>
                                                    OUI
                                                    <input type="radio" value="oui" checked={status === "oui"} onChange={() => setStatus("oui")} />
                                                </label>
                                                <label>
                                                    NON
                                                    <input type="radio" value="non" checked={status === "non"} onChange={() => setStatus("non")} />
                                                </label>
                                            </div>
                                            {status === "non" && (
                                                <div>
                                                    <p>Confirmez-vous le motif ?</p>
                                                    <div>
                                                        <label>
                                                            <input type="text" value={otherMotif} onChange={(e) => setOtherMotif(e.target.value)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button onClick={() => setConfirmNoVisit(true)}>Confirmez-vous ne pas avoir effectué de déplacements ce jour là ?</button>
                                    )}
                                
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
                                <div className='feuille-jj'>
                                    <h3>Fiche clôturée</h3>
                                    <p>Ville : {feuilleDuJour.city}</p>
                                    <p>Statut : {feuilleDuJour.status}</p>
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
                                <form onSubmit={handleCloturerFiche} className='form-feuilledj feuille-jj'>   
                                    <label>Ville</label>
                                    <input type="text" value={feuilleDuJour.city} onChange={(e) => setFeuilleDuJour({...feuilleDuJour, city: e.target.value})} />

                                    <label>Statut</label>
                                    <div className='status'>
                                        <input className='checkbox' type="radio" value="prospect" checked={status === "Prospect"} onChange={() => setStatus("prospect")} />
                                        <p>Prospect</p>
                                    </div>   
                                    <div className='status'>   
                                        <input className='checkbox' type="radio" value="client" checked={status === "Client"} onChange={() => setStatus("client")} /> 
                                        <p>Client</p>               
                                    </div>
                                    
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
                                    
                                    <button type="submit" className='button-colored' onClick={handleCloturerFiche}>Clôturer la fiche</button>
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
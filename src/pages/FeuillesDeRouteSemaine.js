
// fichier FeuillesDeRouteSemaine.js

import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase.config'
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore'
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
    const [otherMotif, setOtherMotif] = useState('')
    const [isSignatureDone, setIsSignatureDone] = useState(false)
    const [isSelectedPeriodShown, setIsSelectedPeriodShown] = useState(false)
    const [missingDays, setMissingDays] = useState([]);
    const [showMissingDayModal, setShowMissingDayModal] = useState(false);
    const [currentMissingDay, setCurrentMissingDay] = useState(null)
    const [isThisMonthOpen, setIsThisMonthOpen] = useState(false);
    const [monthlyFeuillesDeRoute, setMonthlyFeuillesDeRoute] = useState([]); 
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
        const isFridayAfterSix = currentDate.getDay() === 4 && currentDate.getHours() >= 8 // 4 jeudi 
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

    const getMonth = (date) => {
        return date.getMonth() + 1; // Months are zero-based, so add 1
    };

    const displayThisMonth = async () => {
        setIsThisMonthOpen(true); 
        setisThisWeekOpen(false);

        const today = new Date();
        const currentMonth = getMonth(today);

        const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
        const feuillesDeRouteSnapshot = await getDocs(query(feuillesDeRouteRef, where("userId", "==", uid)));
        const feuillesDeRouteData = feuillesDeRouteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const filtered = feuillesDeRouteData.filter(feuille => {
            if (!feuille.date) {
                return false;
            }
            const feuilleDate = new Date(feuille.date.seconds * 1000);
            const feuilleMonth = getMonth(feuilleDate);
            return feuilleMonth === currentMonth;
        }).sort((a, b) => new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000));

        setMonthlyFeuillesDeRoute(filtered);
    };
    
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

        // Vérifie s'il y a des jours sans feuille de route
        const daysOfWeek = [1, 2, 3, 4, 5]
        const missingDays = daysOfWeek.filter(day => !filtered.some(feuille => new Date(feuille.date.seconds * 1000).getDay() === day))

        if (missingDays.length > 0) {
            setMissingDays(missingDays)
            setCurrentMissingDay(missingDays[0])
            setShowMissingDayModal(true)
        }
    }

    const handleMissingDayMotifSubmit = async () => {
        const dayOfWeek = currentMissingDay;
        const today = new Date();
        const dateOfMissingDay = new Date(today.setDate(today.getDate() - today.getDay() + dayOfWeek));

        const feuilleDeRouteRef = collection(db, 'feuillesDeRoute');
        const newFeuilleDeRoute = {
            date: dateOfMissingDay,
            isVisitsStarted: false,
            motifNoVisits: otherMotif,
            userId: uid,
        };
        const docRef = await addDoc(feuilleDeRouteRef, newFeuilleDeRoute);

        setFilteredFeuillesDeRoute([...filteredFeuillesDeRoute, { id: docRef.id, ...newFeuilleDeRoute }])

        // Fermer la modale et passer au jour manquant suivant
        const remainingMissingDays = missingDays.filter(day => day !== dayOfWeek);
        if (remainingMissingDays.length > 0) {
            setCurrentMissingDay(remainingMissingDays[0]);
        } else {
            setShowMissingDayModal(false);
        }
        setMissingDays(remainingMissingDays);
        setOtherMotif('');
    };

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

    const formatDate2 = (date) => {
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };
  
    const formatDayAndDate = (dayIndex) => {
        const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
        const today = new Date();
        const dateOfMissingDay = new Date(today.setDate(today.getDate() - today.getDay() + dayIndex))
        return `${daysOfWeek[dayIndex]} ${formatDate2(dateOfMissingDay)}`
    };

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
    }

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
            <button className='button-colored' onClick={displayThisMonth}>Feuille de route du mois en cours</button>
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
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm} km</p>
                                    <p><strong>Visites</strong> :</p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>Nom</td> 
                                                <td>Distance</td>
                                                <td>Status</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feuille.stops.map((stop, index) => (
                                            <tr key={index}>
                                                <td>{stop.name}</td>
                                                <td>{stop.distance} km</td>
                                                <td>{stop.status}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
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
                        <div className='signature'>
                            <button className='button-colored sign' onClick={() => setIsSignatureDone(true)}>Signer la feuille de route</button>
                       
                            {isSignatureDone && (
                                <>
                                <ReactSignatureCanvas ref={signatureCanvasRef} canvasProps={{ width: 400, height: 200, className: 'signature-modal' }} />
                                <button className='annuler-signature' onClick={() => setIsSignatureDone(false)}>Annuler</button>
                                <button className='button-colored' onClick={handleSignFiche}>Valider</button> 
                                </>
                            )}
                        </div>
                    )}

                    {filteredFeuillesDeRoute.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p>
                            
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm} km</p>
                                    <p><strong>Visites</strong> :</p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>Nom</td> 
                                                <td>Distance</td>
                                                <td>Status</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feuille.stops.map((stop, index) => (
                                            <tr key={index}>
                                                <td>{stop.name}</td>
                                                <td>{stop.distance} km</td>
                                                <td>{stop.status}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showMissingDayModal && (
                <div className='modal-no-visit'>
                    <div className='content'>
                        <p>Une feuille de route est manquante pour le <br></br> <strong>{formatDayAndDate(currentMissingDay)}</strong></p>
                        <label>Veuillez fournir un motif :</label>
                        <input type="text" value={otherMotif} onChange={(e) => setOtherMotif(e.target.value)} />
                        <button className='button-colored' onClick={handleMissingDayMotifSubmit}>Valider</button>
                    </div>
                </div>
            )}

            {isFeuilleDuJourOpen && (
                <div className='this-day'>
                    <h2>Feuille de route du jour</h2>
                    {feuilleDuJour ? (
                        <>
                            {isFicheCloturee ? (
                                <div className='feuille-jj'>
                                    <h3>Fiche clôturée</h3>
                                    <p><strong>Ville</strong> : {feuilleDuJour.city}</p>
                                    <p><strong>Distance totale</strong> : {feuilleDuJour.totalKm} km</p>
                                    <p><strong>Visites</strong> :</p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>Nom</td> 
                                                <td>Distance</td>
                                                <td>Status</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feuilleDuJour.stops.map((stop, index) => (
                                            <tr key={index}>
                                                <td>{stop.name}</td>
                                                <td>{stop.distance} km</td>
                                                <td>{stop.status}</td>
                                            </tr>  
                                            ))}
                                        </tbody>
                                    </table>
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

            {isThisMonthOpen && (
                <div className='this-month'>
                    <button className='close-btn' onClick={() => setIsThisMonthOpen(false)}>
                        <img src={close} alt="fermer" />
                    </button>
                    <h2>Feuille de route du mois en cours</h2>

                    {monthlyFeuillesDeRoute.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p>
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm} km</p>
                                    <p><strong>Visites</strong> :</p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <td>Nom</td> 
                                                <td>Distance</td>
                                                <td>Status</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feuille.stops.map((stop, index) => (
                                            <tr key={index}>
                                                <td>{stop.name}</td>
                                                <td>{stop.distance} km</td>
                                                <td>{stop.status}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <>
                                    <p>Visites commencées : {feuille.isVisitsStarted ? 'Oui' : 'Non'}</p>
                                    <p>Motif de non-visite : {feuille.motifNoVisits}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeuillesDeRouteSemaine
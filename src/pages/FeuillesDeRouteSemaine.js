
// fichier FeuillesDeRouteSemaine.js

import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase.config'
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore'
import back from "../assets/back.png" 
import ReactSignatureCanvas from 'react-signature-canvas'
//import { PDFDownloadLink } from '@react-pdf/renderer'
//import FeuillesDeRoutePDF from '../components/FeuillesDeRoutePDF'

function FeuillesDeRouteSemaine({ uid, onReturn }) {

    const [feuillesDeRoute, setFeuillesDeRoute] = useState([])
    const [fdrSemaine, setFdrSemaine] = useState([])
    const [filteredFeuillesDeRoute, setFilteredFeuillesDeRoute] = useState([])
    const [filteredFeuilles, setFilteredFeuilles] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isThisWeekOpen, setisThisWeekOpen] = useState(false)
    const [feuilleDuJour, setFeuilleDuJour] = useState(null)
    //eslint-disable-next-line 
    const [isFeuilleDuJourOpen, setIsFeuilleDuJourOpen] = useState(true)
    const [isFicheCloturee, setIsFicheCloturee] = useState(false)
    const [otherMotif, setOtherMotif] = useState('')
    const [missingDays, setMissingDays] = useState([]);
    const [showMissingDayModal, setShowMissingDayModal] = useState(false);
    const [currentMissingDay, setCurrentMissingDay] = useState(null) 
    const [errorNoSignature, setErrorNoSignature] = useState("")
    const [successSignature, setSuccessSignature] = useState("")
    const [selectedMonth, setSelectedMonth] = useState("");
    //eslint-disable-next-line 
    const [signatureImage, setSignatureImage] = useState('');
    const [signatureImage2, setSignatureImage2] = useState('');
    const [msgError, setMsgError] = useState("")
    const [errorMsg, setErrorMsg ]= useState("")
    const [noFicheMsg, setNoFicheMsg] = useState(true)
    const signatureCanvasRef = useRef() 
    const signatureCanvasRef2 = useRef() 

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

    // récupère toutes les feuilles de route de la semaine du user
    useEffect(() => {
        if (!uid) return

        const fetchFeuilles = async () => {
            const feuillesDeRouteRef = collection(db, 'fdrSemaine')
            const q = query(feuillesDeRouteRef, where('userId', '==', uid))
            const querySnapshot = await getDocs(q)

            const feuillesDeRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(), 
            }))

            setFdrSemaine(feuillesDeRouteData)
        }

        fetchFeuilles()
    }, [uid])

    useEffect(() => {
        // Appel à displayFeuilleDuJour au chargement initial pour afficher la feuille du jour
        displayFeuilleDuJour()
        //eslint-disable-next-line 
    }, [feuillesDeRoute])   


    useEffect(() => {
        if (feuilleDuJour) {
            setIsFicheCloturee(feuilleDuJour.isClotured || false);
        }
    }, [feuilleDuJour])

    useEffect(() => {
        const fetchSignature = async () => {
            try {
                const fdrSemaineRef = collection(db, 'fdrSemaine'); 
                const querySnapshot = await getDocs(fdrSemaineRef);
                
                querySnapshot.forEach((doc) => {
                    const feuille = doc.data();
                    if (feuille.signature) {
                        setSignatureImage(feuille.signature);
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la récupération de la signature :', error);
            }
        };

        fetchSignature();
    }, []);

    useEffect(() => {
        const fetchSignature2 = async () => {
            try {
                const fdrSemaineRef = collection(db, 'feuillesDeRoute'); 
                const querySnapshot = await getDocs(fdrSemaineRef);
                
                querySnapshot.forEach((doc) => {
                    const feuille = doc.data();
                    if (feuille.signature) {
                        setSignatureImage2(feuille.signature);
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la récupération de la signature :', error);
            }
        };

        fetchSignature2();
    }, []);
     
    const displayFeuilleDuJour = () => {
        const today = new Date();
        const currentHour = today.getHours();
        const endOfDayHour = 22; // Modifier en fonction de votre besoin (par exemple, 22 pour 22h)

        // Si l'heure actuelle est après l'heure de fin de journée, on considère comme étant le jour suivant
        const targetDate = currentHour >= endOfDayHour ? new Date(today.getTime() + 24 * 60 * 60 * 1000) : today;
        const todayDate = targetDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

        const feuille = feuillesDeRoute.find(feuille => { 
            if (!feuille.date) {
                return false;
            }

            const feuilleDate = new Date(feuille.date.seconds * 1000).toISOString().split('T')[0];
            return feuilleDate === todayDate; 
        })

        setFeuilleDuJour(feuille || null)
         
        // Clôture automatique si non clôturée avant 22h
        if (feuille && !feuille.isClotured && currentHour >= 22) {
            handleCloturerFiche(new Event('submit')); // Simuler la clôture de la fiche
        }
    }

    const months = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ];

    const filterFeuillesParMois = () => {
        if (!selectedMonth) {
            setFilteredFeuilles([])
            return;
        }
        
        const selectedMonthIndex = months.findIndex(m => m === selectedMonth);
        const filtered = fdrSemaine.filter(feuille => {
            const feuilleDate = new Date(feuille.dateSignature.seconds * 1000);
            return feuilleDate.getMonth() === selectedMonthIndex;
        });
        setFilteredFeuilles(filtered);

        if (filtered.length === 0) {
            setNoFicheMsg("Aucune fiche enregistrée pour ce mois-ci")
        }
        else {
            setNoFicheMsg("")
        }
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value); // Met à jour l'état avec le mois sélectionné
    };

    const filterFeuillesParPeriode = () => {
        if (!startDate || !endDate) {
            setFilteredFeuilles([]); 
            return;
        }
    
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        // Ajouter un jour à la date de fin pour inclure toute cette journée
        endDateObj.setDate(endDateObj.getDate() + 1);
    
        const filtered = fdrSemaine.filter(feuille => {
            const feuilleDate = new Date(feuille.dateSignature.seconds * 1000);
            return feuilleDate >= startDateObj && feuilleDate < endDateObj; // Utiliser < au lieu de <= pour exclure exactement minuit de la journée suivante
        });
    
        setFilteredFeuilles(filtered);

        if (filtered.length === 0) {
            setNoFicheMsg("Aucune fiche enregistrée pour cette période")
        }
        else {
            setNoFicheMsg("")
        }
    };

    // Fonction appelée lors du changement de date de début
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value); // Met à jour l'état avec la date de début sélectionnée
    };

    // Fonction appelée lors du changement de date de fin
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value); // Met à jour l'état avec la date de fin sélectionnée
    };

    const handleStopStatusChange = (index, newStatus) => {
        const newStops = [...feuilleDuJour.stops];
        newStops[index].status = newStatus;
        setFeuilleDuJour({ ...feuilleDuJour, stops: newStops });
    };

    // configure la semaine 
    const getWeek = (date) => {
        const dayOfWeek = date.getDay(); // 0 pour dimanche, 1 pour lundi, ..., 6 pour samedi
        const firstDayOfWeek = new Date(date); // Clone la date pour ne pas modifier l'original
        firstDayOfWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Réglez le premier jour de la semaine à lundi
        const onejan = new Date(firstDayOfWeek.getFullYear(), 0, 1); // Premier jour de l'année
        const week = Math.ceil((((firstDayOfWeek - onejan) / 86400000) + onejan.getDay() + 1) / 7); // Calcul du numéro de semaine
        return week;
    }

    const formatDate2 = (date) => {
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleCloturerFiche = async (e) => {
        e.preventDefault()
        
        if (feuilleDuJour && !signatureCanvasRef2.current.isEmpty()) {
            const feuilleRef = doc(db, 'feuillesDeRoute', feuilleDuJour.id)
            await updateDoc(feuilleRef, { ...feuilleDuJour, isClotured: true, signature: signatureCanvasRef2.current.getTrimmedCanvas().toDataURL('image/png')})
            setIsFicheCloturee(true)
        }
        else {
            setErrorMsg("Veuillez remplir et signer votre fiche")
        }
    }

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

    const handleOpenWeekFiche = () => {
        // Vérifie si le jour et l'heure actuels permettent la signature
        //const currentDate = new Date();
        displayThisWeek()
        // Vérification si on est vendredi 5 après 8h pour autoriser la signature
        //if (currentDate.getDay() === 6 && currentDate.getHours() >= 12 && currentDate.getHours() < 22) {
       //     displayThisWeek()
        //} else {
           setMsgError("Vous pouvez visionner et signer votre feuille de route de la semaine uniquement chaque vendredi entre 17h et 22h.");
        //}
    }
    const handleSignFiche = async () => { 
        
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
            setisThisWeekOpen(false)
            setSuccessSignature("Votre feuille de route est enregistrée avec succès !")
        }
        else {
            setErrorNoSignature("Veuillez signer votre feuille de route.")
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

    const formatDayAndDate = (dayIndex) => {
        const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
        const today = new Date();
        const dateOfMissingDay = new Date(today.setDate(today.getDate() - today.getDay() + dayIndex))
        return `${daysOfWeek[dayIndex]} ${formatDate2(dateOfMissingDay)}`
    }

    return (
        <div className="feuilles-de-route-section">
            <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            <header> 
                <h1>Feuilles de route de la semaine</h1>
            </header>

            <div>
                <div className="filters">
                    <select value={selectedMonth} className='custom-select' onChange={handleMonthChange}>
                        <option value="">Sélectionner un mois</option>
                        {months.map((month, index) => (
                            <option key={index} value={month}>{month}</option>
                        ))}
                    </select>
                    <button className='button-colored' onClick={filterFeuillesParMois}>Filtrer par mois</button>
                </div>
                <div className="date-filters">
                    <label>Date de début </label>
                    <input className='custom-select un' type="date" value={startDate} onChange={handleStartDateChange}  /> <br></br> 
                   
                    <label>Date de fin</label>
                    <input type="date" className='custom-select' value={endDate} onChange={handleEndDateChange} />
                    
                    <button className='button-colored' onClick={filterFeuillesParPeriode}>Filtrer par période</button>
                    <p style={{textAlign : "center"}} className='error-message'>{noFicheMsg}</p>
                </div>

                {/*<PDFDownloadLink 
                document={<FeuillesDeRoutePDF filteredFeuilles={filteredFeuilles} />}
                fileName="feuilles-de-route.pdf"
                >
                {({ loading }) => loading ? 'Création du document...' : 'Exporter en PDF'}
                    </PDFDownloadLink>*/}

                <div className="feuilles-de-route-list">
                    {filteredFeuilles.length > 0 ? (
                        filteredFeuilles.map(feuille => (
                            <div key={feuille.id} className="this-week">  
                                <h2 style={{textAlign: "center"}}>Semaine du {formatDate(feuille.dateSignature)}</h2>
                                <div className="dayOn-section">
                                    {feuille.dayOn && feuille.dayOn.length > 0 && (
                                        <div className='feuille-jj'>
                                            
                                            {feuille.dayOn.map((day, index) => (
                                                <div key={index}>
                                                    <p className='date'>{formatDate(day.date)}</p>
                                                    <p><strong>Ville</strong> : {day.city}</p>
                                                    <p><strong>Distance totale</strong> : {day.totalKm.toFixed(2)}{day.unitTotalKm}</p>
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
                                                            {day.stops.map((stop, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{stop.name}</td>
                                                                    <td>{stop.distance.toFixed(2)}{stop.unitDistance}</td>
                                                                    <td>{stop.status}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="dayOff-section">
                                    {feuille.dayOff && feuille.dayOff.length > 0 && (
                                        <div>
                                            {feuille.dayOff.map((day, index) => (
                                                 
                                                <div className='feuille-jj' key={index}>
                                                    <p className='date'>{formatDate(day.date)}</p>
                                                    <p>Visites effectuées : Non</p>
                                                    <p>Motif de non-visite : {day.motifNoVisits}</p>
                                                </div>
                                            ))}
                                        </div>    
                                    )}
                                </div>
                                <div className='signature-draw'>
                                    <img width={150} src={feuille.signature} alt="" /> 
                                    <p>Signé le : {formatDate(feuille.dateSignature)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                        
                        </> 
                    )}
                </div>
            </div>
            <p className='error-message'style={{textAlign: "center"}} >{msgError}</p>
            <button className='button-colored sign' onClick={handleOpenWeekFiche}>Signer la feuille de route de la semaine</button>
            <p className='success'>{successSignature}</p>
            
            {isThisWeekOpen && (
                <div className='this-week'>
                    <h2>Feuille de route de la semaine en cours</h2>

                    {filteredFeuillesDeRoute.map(feuille => (
                        <div className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p> 
                            
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm.toFixed(2)}{feuille.unitTotalKm}</p>
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
                                                <td>{stop.distance.toFixed(2)}{stop.unitDistance}</td>
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
                    <div className='signature'>
                        <p className='error-message'>Veuillez signer votre feuille de route de la semaine dans le cadre ci-dessous</p>
                        <p className='error-message'>{errorNoSignature}</p>
                        <ReactSignatureCanvas ref={signatureCanvasRef} canvasProps={{ width: 250, height: 200, className: 'signature-modal' }} />
                        <button className='button-colored' onClick={handleSignFiche}>Valider</button> 
                    </div>
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
                                    <p><strong>Distance totale</strong> : {feuilleDuJour.totalKm.toFixed(2)}{feuilleDuJour.unitTotalKm}</p>
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
                                                <td>{stop.distance?.toFixed(2)}{stop.unitDistance}</td>
                                                <td>{stop.status}</td>
                                            </tr>  
                                            ))}
                                        </tbody>
                                    </table>
                                    <p style={{marginTop: "20px", fontSize: "15px"}}>Clôturée le : {formatDate(feuilleDuJour.date)}</p>
                                    <img src={signatureImage2} width={120} alt="signature" />  
                                </div>
                            ) : (
                                <form onSubmit={handleCloturerFiche} className='form-feuilledj feuille-jj'>  
                                    <p className='info'><strong>Veuillez clôturée votre fiche. Si une information est incorrect, modifez-la avant de clôturer la fiche.</strong></p>
                                    <label>Ville</label>
                                    <input type="text" value={feuilleDuJour.city} onChange={(e) => setFeuilleDuJour({...feuilleDuJour, city: e.target.value})} />
                                    
                                    <label>Adresse de départ</label>
                                    <input type="text" value={feuilleDuJour.departureAddress} onChange={(e) => setFeuilleDuJour({...feuilleDuJour, departureAddress: e.target.value})}/>
                                    
                                    <label>Distance totale</label>
                                    <p className='total-dist'>{feuilleDuJour.totalKm?.toFixed(2)}{feuilleDuJour.unitTotalKm}</p>
                                    
                                    {feuilleDuJour.stops.map((stop, index) => (
                                        <div key={index}>
                                            <label className='title-visit'>Visite {index + 1} </label>
                                            <input type="text" value={stop.name} 
                                                onChange={(e) => {
                                                    const newStops = [...feuilleDuJour.stops];
                                                    newStops[index].name = e.target.value;
                                                    setFeuilleDuJour({...feuilleDuJour, stops: newStops});
                                                }}
                                            />
                                            <label>Distance</label>
                                            <p className='inline'>{stop.distance?.toFixed(2)}{stop.unitDistance}</p><br></br>
                                            <label>Statut</label>
                                            <div className='status'>
                                                <input className='checkbox' type="radio" value="Prospect" checked={stop.status === "Prospect"} onChange={() => handleStopStatusChange(index, "Prospect")} />
                                                <p>Prospect</p>
                                            </div>   
                                            <div className='status'>   
                                                <input className='checkbox' type="radio" value="Client" checked={stop.status === "Client"} onChange={() => handleStopStatusChange(index, "Client")} /> 
                                                <p>Client</p>               
                                            </div>
                                            
                                        </div>
                                        
                                    ))}

                                <div className='signature sign-fdj'>
                                    <p className='error-message'>Veuillez signer votre feuille de route de la semaine dans le cadre ci-dessous</p>
                                    <p className='error-message'>{errorMsg}</p> 
                                    <ReactSignatureCanvas ref={signatureCanvasRef2} canvasProps={{ width: 250, height: 200, className: 'signature-modal' }} />
                                    
                                </div>
                                    
                                    <button type="submit" className='button-colored' onClick={handleCloturerFiche}>Clôturer la fiche</button>
                                </form>
                            )}
                        </>
                    ) : (
                        <p className='none'>Aucune feuille de route enregistrée pour aujourd'hui.</p>
                    )}
                </div>
            )}

        </div>
    );
}

export default FeuillesDeRouteSemaine
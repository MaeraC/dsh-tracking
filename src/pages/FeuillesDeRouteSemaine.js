
// fichier FeuillesDeRouteSemaine.js

import { useState, useEffect } from 'react'
import { db } from '../firebase.config'
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore'
import back from "../assets/back.png"
import ReactSignatureCanvas from 'react-signature-canvas'
import { useRef } from "react";
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../assets/download.png"   

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
    const [message, setMessage] = useState("")  
    const [errorMsg, setErrorMsg ]= useState("")
    const [noFicheMsg, setNoFicheMsg] = useState(true)
    const [usersMap, setUsersMap] = useState({})
    const [feuillesNonCloturees, setFeuillesNonCloturees] = useState([]);

    const signatureCanvasRef = useRef({}) 
    //const signatureCanvasRef2 = useRef() 
    const pageRef = useRef()
    const pageRef2 = useRef()
        
    const generatePDF = (input, filename) => {
            if (!input) {
                console.error('Erreur : référence à l\'élément non valide');
                return;
            }
    
            html2canvas(input, {
                useCORS: true,
                scale: 2, // Augmente la résolution du canvas pour une meilleure qualité
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const width = pdfWidth;
                const height = width / ratio;
    
                let position = 0;
    
                if (height > pdfHeight) {
                    const totalPages = Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth));
                    for (let i = 0; i < totalPages; i++) {
                        const pageCanvas = document.createElement('canvas');
                        pageCanvas.width = canvasWidth;
                        pageCanvas.height = canvasWidth * pdfHeight / pdfWidth;
                        const pageContext = pageCanvas.getContext('2d');
                        pageContext.drawImage(canvas, 0, position, canvasWidth, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
                        const pageImgData = pageCanvas.toDataURL('image/png');
                        if (i > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        position += pageCanvas.height;
                    }
                } else {
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                }
    
                pdf.save(filename);
            }).catch(error => {
                console.error('Erreur lors de la génération du PDF :', error);
            });
    };

    const downloadPDF = () => {
            const input = pageRef.current;
            generatePDF(input, "feuille-du-jour.pdf");
    };
    
    const downloadPDF2 = () => { 
            const input = pageRef2.current;
            generatePDF(input, "fdr.pdf");
    };

    // Récupération des données des utilisateurs
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
            const nonCloturees = feuillesDeRouteData.filter(feuille => !feuille.isClotured && feuille.isVisitsStarted);
            setFeuillesNonCloturees(nonCloturees);
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
        const endOfDayHour = 23;
        // Si l'heure actuelle est après l'heure de fin de journée, on considère comme étant le jour suivant
        const targetDate = currentHour >= endOfDayHour ? new Date(today.getTime() + 24 * 60 * 60 * 1000) : today;
        const todayDate = targetDate.toISOString().split('T')[0];
        const feuille = feuillesDeRoute.find(feuille => {
            if (!feuille.date) {
                return false;
            }
            const feuilleDate = new Date(feuille.date.seconds * 1000).toISOString().split('T')[0];
            return feuilleDate === todayDate;
        });
        setFeuilleDuJour(feuille || null);
        setIsFeuilleDuJourOpen(true);
    }
    const handleCloturerFiche = async (e, feuille) => {
        e.preventDefault();
        if (!signatureCanvasRef.current[feuille.id] || signatureCanvasRef.current[feuille.id].isEmpty()) {
            setErrorMsg("Veuillez remplir et signer votre fiche");
            return;
        }
        const feuilleRef = doc(db, 'feuillesDeRoute', feuille.id);
        await updateDoc(feuilleRef, {
            ...feuille,
            isClotured: true,
            signature: signatureCanvasRef.current[feuille.id].getTrimmedCanvas().toDataURL('image/png'),
        });
        setFeuillesNonCloturees(feuillesNonCloturees.filter(f => f.id !== feuille.id));
        setIsFicheCloturee(true);
        setMessage("Feuille de roue enregistrée avec succès !")
    };
    

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

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value); // Met à jour l'état avec la date de début sélectionnée
    }
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value); // Met à jour l'état avec la date de fin sélectionnée
    };

    const handleStopStatusChange = (feuille, index, newStatus) => {
        const newStops = [...feuille.stops];
        newStops[index].status = newStatus;
        setFeuilleDuJour({ ...feuille, stops: newStops });
    };

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
            setisThisWeekOpen(false)
            setSuccessSignature("Votre feuille de route est enregistrée avec succès !")
        }
        else { setErrorNoSignature("Veuillez signer votre feuille de route.") }
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
        const remainingMissingDays = missingDays.filter(day => day !== dayOfWeek)
        
        if (remainingMissingDays.length > 0) {
            setCurrentMissingDay(remainingMissingDays[0]);
        } else {
            setShowMissingDayModal(false);
        }
        setMissingDays(remainingMissingDays);
        setOtherMotif('');
    };

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
    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
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

                <div className="feuilles-de-route-list" ref={pageRef2}>
                    {filteredFeuilles.length > 0 && (
                        <button className="download3 button-colored" onClick={downloadPDF2}><img src={download} alt="" /></button>
                    )}
                    {filteredFeuilles.length > 0 && (
                        filteredFeuilles.map(feuille => (
                            <div key={feuille.id} className="this-week">   
                                <h2 style={{textAlign: "center"}}>Semaine du {formatDate(feuille.dateSignature)}</h2>
                                <div className="dayOn-section">
                                    {feuille.dayOn && feuille.dayOn.length > 0 && (
                                        <div className='feuille-jj'>
                                            
                                            {feuille.dayOn.map((day, index) => (
                                                <div key={index} style={{marginBottom: "30px"}}>
                                                    <p className='date'>{formatDate(day.date)}</p>
                                                    <p><strong>Ville</strong> : {day.city}</p>
                                                    <p><strong>Distance totale</strong> : {formatDistance(day.totalKm)}</p>
                                                    <p><strong>Visites</strong> :</p>
                                                        {day.stops.map((stop, idx) => (
                                                            <div key={idx}  style={{ width: "100%", background: "#bebebe", padding: "2px", marginBottom: "10px", fontSize: "14px"}}>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Nom</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.name}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Adresse</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.address}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Ville</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.city}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Code postal</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.postalCode}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Distance</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.distance)}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Heure d'arrivée</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.arrivalTime)}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Heure de départ</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.departureTime)}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Statut</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}> {stop.status}</p>
                                                                </div>
                                                            </div>
                                                        ))}
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
                                    <img width={120} src={feuille.signature} alt="" /> 
                                    <p>{usersMap[feuille.userId]?.firstname} {usersMap[feuille.userId]?.lastname}</p>
                                    <p>Signé le : {formatDate(feuille.dateSignature)}</p>
                                </div>
                            </div>
                        ))
                    )}
                    
                </div>
            </div>
            <p className='error-message'style={{textAlign: "center"}} >{msgError}</p>
            <button className='button-colored sign' onClick={handleOpenWeekFiche}>Signer la feuille de route de la semaine</button>
            <p className='success'>{successSignature}</p>
            
            {isThisWeekOpen && (
                <div className='this-week' style={{marginBottom: "20px"}}>

                    <h2>Feuille de route de la semaine en cours</h2>

                    {filteredFeuillesDeRoute.map(feuille => ( 
                        <div style={{marginBottom: "20px"}} className='feuille-jj' key={feuille.id}>
                            <p className='date'>{formatDate(feuille.date)}</p> 
                            
                            {feuille.isVisitsStarted ? (
                                <>
                                    <p><strong>Ville</strong> : {feuille.city}</p>
                                    <p><strong>Distance totale</strong> : {feuille.totalKm.toFixed(2)}{feuille.unitTotalKm}</p>
                                    <p><strong>Visites</strong> :</p>
                                    {feuille.stops.map((stop, index) => (
                                        <div key={index}  style={{ width: "100%", background: "#bebebe", padding: "2px", marginBottom: "10px", fontSize: "14px"}}>
                                            <div style={{display: "flex", width: "100%"}}>
                                                <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Nom</p>
                                                <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.name}</p>
                                            </div>
                                            <div style={{display: "flex", width: "100%"}}>
                                                <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Adresse</p>
                                                <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.address}</p>
                                            </div>
                                            <div style={{display: "flex", width: "100%"}}>
                                                <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Ville</p>
                                                <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.city}</p>
                                            </div>
                                            <div style={{display: "flex", width: "100%"}}>
                                                <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Code postal</p>
                                                <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.postalCode}</p>
                                            </div>
                                            <div style={{display: "flex", width: "100%"}}>
                                                <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Distance</p>
                                                <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.distance)}</p>
                                            </div>
                                            <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Heure d'arrivée</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.arrivalTime)}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Heure de départ</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.departureTime)}</p>
                                                                </div>
                                            <div style={{display: "flex", width: "100%"}}>
                                                <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Statut</p>
                                                <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}> {stop.status}</p>
                                            </div>
                                        </div>
                                    ))}
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

      
            <div className='this-day' ref={pageRef}>
                <h2>Feuilles de route non clôturées</h2>
            {feuillesNonCloturees.length > 0 ? (
                feuillesNonCloturees.map((feuille, index) => (
                    <div className='this-day' ref={pageRef} key={feuille.id}>
                        <h2>{formatDate(feuille.date)}</h2>
                        <>
                            {isFicheCloturee ? (
                                <div className='feuille-jj feuille-du-jour' >
                                    <button className="download2 button-colored" onClick={downloadPDF}><img src={download} alt="" /></button>
                                    <h3>Fiche clôturée</h3>
                                    <p><strong>Ville</strong>: {feuille?.city}</p>
                                    <p><strong>Distance totale</strong>: {formatDistance(feuille.totalKm)}</p>
                                    <p><strong>Visites</strong>:</p>
                                        {feuille.stops.map((stop, idx) => (
                                            <div key={idx} style={{ width: "100%", background: "#bebebe", padding: "2px", marginBottom: "10px", fontSize: "14px"}}>
                                                <div style={{display: "flex", width: "100%"}}>
                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Nom</p>
                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.name}</p>
                                                </div>
                                                <div style={{display: "flex", width: "100%"}}>
                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Adresse</p>
                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.address}</p>
                                                </div>
                                                <div style={{display: "flex", width: "100%"}}>
                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Ville</p>
                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.city}</p>
                                                </div>
                                                <div style={{display: "flex", width: "100%"}}>
                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Code postal</p>
                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{stop.postalCode}</p>
                                                </div>
                                                <div style={{display: "flex", width: "100%"}}>
                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Distance</p>
                                                    <p>{formatDistance(stop.distance)}</p>
                                                </div>
                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Heure d'arrivée</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.arrivalTime)}</p>
                                                                </div>
                                                                <div style={{display: "flex", width: "100%"}}>
                                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Heure de départ</p>
                                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}>{formatDistance(stop.departureTime)}</p>
                                                                </div>
                                                <div style={{display: "flex", width: "100%"}}>
                                                    <p style={{width: "30%", background: "#cfcfcf", margin: "2px", padding: "5px", fontWeight: "bold"}}>Statut</p>
                                                    <p style={{width: "70%", background: "white", margin: "2px", padding: "5px 10px"}}> {stop.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    <p style={{ marginTop: "20px", fontSize: "15px" }}>Clôturée le: {formatDate(feuille.date)}</p>
                                    <p>{usersMap[feuille.userId]?.firstname} {usersMap[feuille.userId]?.lastname}</p>
                                    <img src={signatureImage2} width={100} height={100} alt="signature" />
                                </div>
                            ) : (
                                <form onSubmit={(e) => handleCloturerFiche(e, feuille)} className='form-feuilledj feuille-jj'>
                                    <p className='info'><strong>Veuillez clôturer votre fiche. Si une information est incorrecte, modifiez-la avant de clôturer la fiche.</strong></p>
                                    <label>Ville</label>
                                    <input type="text" value={feuille.city} onChange={(e) => setFeuilleDuJour({ ...feuille, city: e.target.value })} />
                                    <label>Adresse de départ</label>
                                    <input type="text" value={feuille.departureAddress} onChange={(e) => setFeuilleDuJour({ ...feuille, departureAddress: e.target.value })} />
                                    <label>Distance totale</label>
                                    <p className='total-dist'>{formatDistance(feuille.totalKm)}</p>
                                    {feuille.stops?.map((stop, idx) => (
                                        <div key={idx}>
                                            <label className='title-visit'>Visite {idx + 1} </label>
                                            <input type="text" value={stop.name}
                                                onChange={(e) => {
                                                    const newStops = [...feuille.stops];
                                                    newStops[idx].name = e.target.value;
                                                    setFeuilleDuJour({ ...feuille, stops: newStops });
                                                }}
                                            />
                                            <label>Distance</label>
                                            <p className='inline'>{formatDistance(stop.distance)}</p><br />
                                            <label>Adresse</label>
                                            <p className='inline'>{stop.address}</p><br />
                                            <label>Code postal</label>
                                            <p className='inline'>{stop.postalCode}</p><br />
                                            <label>Heure d'arrivée</label>
                                            <p className='inline'>{stop.arrivalTime}</p><br />
                                            <label>Heure de départ</label>
                                            <p className='inline'>{stop.departureTime}</p><br />
                                            <label>Statut</label>
                                            <div className='status'>
                                                <input className='checkbox' type="radio" value="Prospect" checked={stop.status === "Prospect"} onChange={() => handleStopStatusChange(feuille, idx, "Prospect")} />
                                                <p>Prospect</p>
                                            </div>
                                            <div className='status'>
                                                <input className='checkbox' type="radio" value="Client" checked={stop.status === "Client"} onChange={() => handleStopStatusChange(feuille, idx, "Client")} />
                                                <p>Client</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className='signature sign-fdj'>
                                        <p className='error-message'>Veuillez signer votre feuille de route de la semaine dans le cadre ci-dessous</p>
                                        <p className='error-message'>{errorMsg}</p>
                                        <ReactSignatureCanvas
    ref={(el) => {
        if (!signatureCanvasRef.current) {
            signatureCanvasRef.current = {};
        }
        signatureCanvasRef.current[feuille.id] = el;
    }}
    canvasProps={{ width: 250, height: 200, className: 'signature-modal' }}
/>
                                    </div>
                                    <button type="submit" className='button-colored'>Clôturer la fiche</button>
                                </form>
                            )}
                        </>
                    </div>
                ))
            ) : (
                <>
                <p className='none'>Toutes vos feuilles de route du jour sont clôturées.</p>
                <p className='success-message'>{message}</p>
                </>
            )}
            </div>
          

        </div>
    );
}

export default FeuillesDeRouteSemaine
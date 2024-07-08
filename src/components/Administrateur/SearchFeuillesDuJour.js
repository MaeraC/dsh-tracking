
// fichier SearchFeuillesDuJour.js

import React, { useEffect, useState, useRef } from 'react' 
import { collection, getDocs, query, where, Timestamp, addDoc } from 'firebase/firestore'
import { db } from '../../firebase.config'
import FeuillesHebdoAdmin from './FeuillesHebdoAdmin';
import FeuillesMensuellesAdmin from './FeuillesMensuellesAdmin';
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../../assets/download.png"  

function SearchFeuillesDuJour({ uid }) {
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showResults, setShowResults] = useState(false); 
    const [nombreVisites, setNombreVisites] = useState(0);
    const [nombreVisitesClient, setNombreVisitesClient] = useState(0);
    const [nombreVisitesProspect, setNombreVisitesProspect] = useState(0);
    const [format, setFormat] = useState('')
    const [selectedMonthYear, setSelectedMonthYear] = useState('')
    const [nombreFichesDemonstration, setNombreFichesDemonstration] = useState(0); 
    const [showDaily, setShowDaily] = useState(false);
    const [showWeekly, setShowWeekly] = useState(false);
    const [showMonthly, setShowMonthly] = useState(false); 

    const fdrJourRef = useRef()

    const resetForm = () => {
        setSearchTerm("")
        setStartDate("")
        setEndDate("")
        setSelectedMonthYear("")
        setFormat("")
    }

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
    }, [])

    useEffect(() => {
        if (!selectedUser || (!startDate && !endDate && !selectedMonthYear)) {
            setFeuillesDeRoute([]);
            setNombreVisites(0);
            setNombreVisitesClient(0);
            setNombreVisitesProspect(0);
            return;
        }
    
        const fetchFeuillesDeRoute = async () => {
            const feuillesDeRouteRef = collection(db, 'feuillesDeRoute');
            let q = query(feuillesDeRouteRef, where('userId', '==', selectedUser.userId));
    
            if (startDate && endDate) {
                const startTimestamp = Timestamp.fromDate(new Date(startDate));
                const endTimestamp = Timestamp.fromDate(new Date(endDate));
                q = query(q, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
            } else if (selectedMonthYear) {
                const [selectedYear, selectedMonth] = selectedMonthYear.split('-').map(Number);
                const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
                const endOfMonth = new Date(selectedYear, selectedMonth, 0); // Dernier jour du mois
                const startTimestamp = Timestamp.fromDate(startOfMonth);
                const endTimestamp = Timestamp.fromDate(endOfMonth);
                q = query(q, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
            }
    
            try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const feuilles = querySnapshot.docs.map(doc => doc.data());
                    setFeuillesDeRoute(feuilles);
                    calculateVisites(feuilles);
                } else {
                    setFeuillesDeRoute([]);
                    setNombreVisites(0);
                    setNombreVisitesClient(0);
                    setNombreVisitesProspect(0);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des feuilles de route : ", error);
            }
        }; 
        
        const fetchDemonstrationCount = async () => {
            try {
                if (!selectedUser) {
                    return; // Sortir de la fonction si aucun utilisateur n'est sélectionné
                }
        
                const salonsRef = collection(db, 'salons');
                const salonsSnapshot = await getDocs(salonsRef);
                
                let totalDemonstrations = 0;
                let startTimestamp, endTimestamp, selectedYear, selectedMonth;
        
                if (startDate && endDate) {
                    startTimestamp = new Date(startDate).getTime();
                    endTimestamp = new Date(endDate).getTime();
                } else if (selectedMonthYear) {
                    [selectedYear, selectedMonth] = selectedMonthYear.split('-').map(Number);
                }
        
                salonsSnapshot.forEach(doc => {
                    const salonData = doc.data();
                    if (salonData.crDemonstration) {
                        salonData.crDemonstration.forEach(demo => {
                            if (demo.userId === selectedUser.userId && demo.createdAt && demo.createdAt.seconds) { // Vérifier que demo.createdAt et demo.createdAt.seconds sont définis
                                const demoDate = demo.createdAt.seconds * 1000; // Convertir la date Firestore en millisecondes
                                if ((startDate && endDate && demoDate >= startTimestamp && demoDate <= endTimestamp) ||
                                    (selectedMonthYear && selectedYear && selectedMonth && new Date(demoDate).getFullYear() === selectedYear && new Date(demoDate).getMonth() === selectedMonth - 1)) {
                                    totalDemonstrations++;
                                }
                            }
                        });
                    }
                });
        
                setNombreFichesDemonstration(totalDemonstrations);
            } catch (error) {
                console.error("Erreur lors de la récupération des fiches de démonstration : ", error);
            }
        };
        
        
        

        fetchFeuillesDeRoute();
        fetchDemonstrationCount();

        // eslint-disable-next-line
    }, [selectedUser, startDate, endDate, showResults, selectedMonthYear])

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
    }

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    }
    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return ''; 
        }
        const dateObject = timestamp.toDate();
        return dateObject.toLocaleDateString(); 
    }
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('fr-FR', options);
    }

    const handleUserSearch = (event) => {
        const { value } = event.target;
        setSearchTerm(value);

        const filtered = Object.values(usersMap).filter(user =>
            user.role === 'commercial' &&
            (user.firstname.toLowerCase().includes(value.toLowerCase()) || user.lastname.toLowerCase().includes(value.toLowerCase()))
        )
        setFilteredUsers(filtered);
    }
    const handleUserSelection = (user) => {
        setSelectedUser(user);
        setSearchTerm(`${user.firstname} ${user.lastname}`)
        setFilteredUsers([]);
    }

    const handleStartDateChange = (event) => {
        const { value } = event.target;
        setStartDate(value);
    }
    const handleEndDateChange = (event) => {
        const { value } = event.target;
        setEndDate(value);
    }
    const handleFormatChange = (event) => { 
        const selectedFormat = event.target.value;
        setFormat(selectedFormat);
        setShowDaily(selectedFormat === 'daily');
        setShowWeekly(selectedFormat === 'weekly');
    }
    const handleMonthChange = (event) => {
        setShowResults(true);
        setShowMonthly(true)
        const newMonthYear = event.target.value;
        setSelectedMonthYear(newMonthYear);
    }
    
    const handleSubmit = () => {
        setShowResults(true);
    }

    const generatePDF = (input, filename) => {
        if (!input) {
            console.error('Erreur : référence à l\'élément non valide');
            return;
        }
    
        const currentDate = new Date();
        const formattedDate = `Téléchargé le ${currentDate.toLocaleDateString()} à ${currentDate.toLocaleTimeString()}`;
    
        html2canvas(input, {
            useCORS: true,
            scale: 2, 
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
    
            const totalPages = height > pdfHeight
                ? Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth))
                : 1;
    
            const addPageNumber = (pdf, pageNumber, totalPages) => {
                pdf.setFontSize(8);
                const pageNumText = `Page ${pageNumber} / ${totalPages}`;
                pdf.text(pageNumText, pdfWidth - 15, pdfHeight - 10);
            };
    
            const addDateTime = (pdf, dateTime) => {
                pdf.setFontSize(8);
                pdf.text(dateTime, pdfWidth - 50, 5);
            };
    
            if (height > pdfHeight) {
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
                    addPageNumber(pdf, i + 1, totalPages);
                    if (i === 0) {
                        addDateTime(pdf, formattedDate);
                    }
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                addPageNumber(pdf, 1, totalPages);
                addDateTime(pdf, formattedDate);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    }
    const downloadPDF = async () => {
        const input = fdrJourRef.current
        generatePDF(input, "feuille-de-route.pdf")

        try {
            await addDoc(collection(db, "historiqueAdmin"), {
                userId: uid,
                date: new Date(),
                action: `Feuille de route de ${searchTerm} téléchargée`,
            })
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'historique : ", error)
        }
    }

    return (
        <div  className='filter-feuilles filter-feuilles-admin' style={{marginTop: "30px", padding: "0 20px"}}>
            <div  className='filters filters-admin'>
                <div className='filters-input-admin'>
                    <div className='input-admin-mini'>
                        <div style={{width: "30%", marginRight: "30px"}} >
                            <label  className='label'>Rechercher un VRP</label><br></br>
                            <input style={{marginBottom: "10px"}} type="text" placeholder="Prénom Nom" value={searchTerm} onChange={handleUserSearch} />
                            <ul className='select-sugg'>
                                {filteredUsers.map(user => (
                                    <li style={{padding: "5px", borderBottom: "#cfcfcf solid 1px"}} key={user.userId} onClick={() => handleUserSelection(user)}>
                                        {user.firstname} {user.lastname}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div  style={{width: "30%", marginRight: "30px"}}>
                            <label  className='label'>Date de début </label><br></br>
                            <input type="date" value={startDate} onChange={handleStartDateChange} />
                        </div>
                        <div  style={{width: "30%", marginRight: "30px"}}>
                            <label className='label'>Date de fin </label><br></br>
                            <input type="date" value={endDate} onChange={handleEndDateChange} />
                        </div>
                    </div>
                    <div className='input-admin-mini'> 
                        <div  style={{width: "30%", marginRight: "30px"}}>
                            <label className='label'>Sélectionner un mois</label><br></br>
                            <input style={{padding: "5px 10px"}} type="month" value={selectedMonthYear} onChange={handleMonthChange} />
                        </div>
                        <div style={{width: "20%", marginRight: "0px"}}>
                            <input type="radio" id="daily" name="format" value="daily" checked={format === 'daily'} onChange={handleFormatChange} className='checkbox' />
                            <label>Feuilles journalières</label>
                        </div><br></br>
                        <div style={{width: "20%", marginRight: "0px"}}>
                            <input type="radio" className='checkbox' id="weekly" name="format" value="weekly" checked={format === 'weekly'} onChange={handleFormatChange} />
                            <label>Feuilles hebdomadaires</label>
                        </div>
                        <button  onClick={handleSubmit} className='button-colored mini'>Valider</button>
                    </div>
                    <button className='reset-form' onClick={resetForm}>Réinitialiser les filtres</button>
                </div>
            </div>

            {showResults && (
                <button style={{display: "flex", alignItems: "center", padding: "5px 20px" , marginTop: "30px"}} className="download-f button-colored" onClick={downloadPDF}><img style={{marginRight: "10px"}} src={download} alt="Télécharger la feuille de route du jour" />Télécharger les feuilles de route</button>
            )}

            <div className='search-test' style={{width: "100%"}} ref={fdrJourRef}>
            {showResults && ( 
                <div  className='filter-feuilles-stats-admin' style={{marginBottom: "20px"}}> 
                    <div className='part1'>
                        <p><strong>Période sélectionnée</strong> : {startDate && endDate ? `Du ${formatDate(startDate)} au ${formatDate(endDate)}` : selectedMonthYear ? new Date(selectedMonthYear.split('-')[0], selectedMonthYear.split('-')[1] - 1).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}</p>
                        <p><strong>Nom du VRP</strong> : {searchTerm}</p>
                    </div> 
                    <div className='part2'>
                        <p><strong>Nombre de visites</strong><span>{nombreVisites}</span></p>
                        <p><strong>Visites client</strong><span>{nombreVisitesClient}</span></p>
                        <p><strong>Visites prospect</strong><span>{nombreVisitesProspect}</span></p>
                        <p><strong>Cr de RDV de démonstration</strong><span>{nombreFichesDemonstration}</span></p>
                    </div>
                </div>
            )}
 
            {showResults && format === 'daily' && showDaily && feuillesDeRoute.length > 0 && (
                <div className="content"> 
                {feuillesDeRoute.map((feuille, index) => (
                    <div key={index} className='feuille-du-jour  feuille-this-filter'>
                        <h3 style={{textAlign: "center", marginBottom: "20px"}}>Feuille du {feuille.date ? formatTimestamp(feuille?.date) : "Date non disponible"}</h3>
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
                        <div style={{background: "white", padding: "20px", marginTop: "20px", paddingTop: "10px"}}>    
                            <p style={{ marginTop: "20px" }}><strong>Total de la distance parcourue </strong>: {formatDistance(feuille.totalKm)}</p>
                            <p style={{ marginTop: "5px" }}><strong>Total des visites effectuées </strong>: {getNombreDeVisites(feuille.stops || [])}</p>
                            <p style={{ marginTop: "5px" }}><strong>Visites client </strong>: {countVisitesByStatus(feuille.stops || [], 'Client')}</p>
                            <p style={{ marginTop: "5px" }}><strong>Visites prospect </strong>: {countVisitesByStatus(feuille.stops || [], 'Prospect')}</p>
                            <p style={{ marginTop: "20px" }}>Validé le <strong>{feuille?.signatureDate}</strong></p> 
                        </div>
                    </div>
                ))} 
                </div>
            )}

            {showResults && format === 'weekly' && showWeekly && feuillesDeRoute.length > 0 && ( 
                <FeuillesHebdoAdmin feuillesDeRoute={feuillesDeRoute} startDate={startDate} endDate={endDate} />
            )}

            {showResults && showMonthly  && selectedMonthYear && selectedUser && (
                <FeuillesMensuellesAdmin feuillesDeRoute={feuillesDeRoute} selectedMonthYear={selectedMonthYear} selectedUser={selectedUser} />
            )}
            </div>
        </div>
    )
}

export default SearchFeuillesDuJour

// fichier SearchFeuillesDuJourCom.js

import React, { useEffect, useState , useRef} from 'react'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase.config'
import jsPDF from "jspdf";   
import html2canvas from "html2canvas";
import download from "../../assets/download.png"    

function SearchFeuillesDuJourCom({ uid }) {
    const [feuillesDeRoute, setFeuillesDeRoute] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showResults, setShowResults] = useState(false); 
    const [nombreVisites, setNombreVisites] = useState(0);
    const [nombreVisitesClient, setNombreVisitesClient] = useState(0);
    const [nombreVisitesProspect, setNombreVisitesProspect] = useState(0);
    const fdrJourRef = useRef()

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
                    const filteredFeuilles = feuilles.filter(feuille => feuille.isVisitsStarted === true); // Filtrer en JavaScript
                    setFeuillesDeRoute(filteredFeuilles)
                    calculateVisites(filteredFeuilles)
                } else {
                    setFeuillesDeRoute([])
                    setNombreVisites(0)
                    setNombreVisitesClient(0)
                    setNombreVisitesProspect(0)
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des feuilles de route : ", error);
            }
        };
    
        fetchFeuillesDeRoute()
        // eslint-disable-next-line
    }, [uid, startDate, endDate, showResults])

    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return ''; 
        }
        const dateObject = timestamp.toDate();
        return dateObject.toLocaleDateString(); 
    }
    const formatDate2 = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
        return new Date(dateStr).toLocaleDateString('fr-FR', options)
    }

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

    const handleStartDateChange = (event) => {
        const { value } = event.target;
        setStartDate(value);
    }
    const handleEndDateChange = (event) => {
        const { value } = event.target;
        setEndDate(value);
    }

    const handleSubmit = () => {
        setShowResults(true); 
    };

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
    
            const totalPages = height > pdfHeight
                ? Math.ceil(canvasHeight / (canvasWidth * pdfHeight / pdfWidth))
                : 1;
    
            const addPageNumber = (pdf, pageNumber, totalPages) => {
                pdf.setFontSize(10);
                const pageNumText = `Page ${pageNumber} / ${totalPages}`;
                pdf.text(pageNumText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
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
                    position += pageCanvas.height;
                }
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
                addPageNumber(pdf, 1, totalPages);
            }
    
            pdf.save(filename);
        }).catch(error => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    };
    
    const downloadPDF = () => {
        const input = fdrJourRef.current;
        generatePDF(input, "feuille-du-jour.pdf");
    };
    

    return (
        <div className='filter-feuilles' style={{marginTop: "30px", width: "75%", padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center"}}>    
            <div className='filters' style={{width: "100%", padding: "20px 50px", boxShadow: "2px 2px 15px #cfcfcf", display: "flex", borderRadius: "20px", justifyContent: "space-between", alignItems: "center"}}>
                <div style={{width: "30%"}}>
                    <label className='label'>Date de début :</label><br></br>
                    <input style={{width: "100%"}} type="date" value={startDate} onChange={handleStartDateChange} />
                </div>
                <div style={{width: "30%"}}>
                    <label className='label'>Date de fin :</label><br></br>
                    <input style={{width: "100%"}} type="date" value={endDate} onChange={handleEndDateChange} />
                </div>
                <button style={{width: "30%", height: "50px"}} className='button-colored' onClick={handleSubmit}>Valider</button>
            </div>

            {showResults && (
                <button style={{display: "flex", alignItems: "center", padding: "5px 20px" , marginTop: "30px"}} className="download-f button-colored" onClick={downloadPDF}><img style={{marginRight: "10px"}} src={download} alt="Télécharger la feuille de route du jour" />Télécharger les feuilles de route</button>
            )}
            <div style={{width: "100%"}} ref={fdrJourRef}>
                {showResults && (
                    <div className='filter-feuilles-stats'>
                        <p><strong>Période sélectionnée</strong> : Du {formatDate2(startDate)} au {formatDate2(endDate)}</p>
                        <div>
                            <p><strong>Nombre de visites</strong><span>{nombreVisites}</span></p> 
                            <p><strong>Visites client</strong><span>{nombreVisitesClient}</span></p>
                            <p><strong>Visites prospect</strong><span>{nombreVisitesProspect}</span></p>
                        </div>
                    </div>
                )}
 
                {showResults && feuillesDeRoute.length > 0 && (
                    <div style={{ width: "100%", padding: "20px 0", display: "flex", flexWrap: "wrap" , justifyContent: "center", }} >   
                    {feuillesDeRoute.map((feuille, index) => (
                        <div className='feuille-du-jour feuille-this-filter' key={index} style={{background: "#DCF1F2", width: "30%", padding: "20px", borderRadius: "20px", margin: "10px",  fontSize: "14px"}} >  
                        
                            <h3 style={{textAlign: "center", marginBottom: "20px"}}>Feuille du {feuille?.date ? formatTimestamp(feuille?.date) : "Date non disponible"}</h3>
                            
                            {feuille?.stops && feuille?.stops.map((stop, idx) => (
                                <>
                                {idx < feuille.stops.length - 1 ? (
                                    <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px", fontSize: "14px" }}><strong>Visite n°{idx + 1}</strong></p>
                                ) : (
                                    <p style={{ background: "white", display: "inline-block", padding: "5px", marginTop: "20px", fontSize: "14px" }}><strong>Retour</strong></p>
                                )}
                                <div className='visites' key={idx}>
                                {stop.name && (
                                        <div  style={{fontSize: "14px"}}>
                                            <p className='titre'>Nom</p>
                                            <p className='texte'>{stop.name}</p>
                                        </div>
                                    )}
                                    {stop.status && (
                                        <div  style={{fontSize: "14px"}}>
                                            <p className='titre'>Statut</p>
                                            <p className='texte'>{stop.status}</p>
                                        </div>
                                    )}
                                    {stop.address && (
                                        <div  style={{fontSize: "14px"}}>
                                            <p className='titre'>Adresse</p>
                                            <p className='texte'>{stop.address}</p>
                                        </div>
                                    )}
                                    {stop.postalCode && stop.city && (
                                        <div  style={{fontSize: "14px"}}>
                                            <p className='titre'>Ville</p>
                                            <p className='texte'>{stop.postalCode} {stop.city}</p>
                                        </div>
                                    )}
                                    {stop.distance !== undefined && (
                                        <div  style={{fontSize: "14px"}}>
                                            <p className='titre'>Km parcourus</p>
                                            <p className='texte'>{formatDistance(stop.distance)}</p>
                                        </div>
                                    )}
                                    {stop.arrivalTime && (
                                        <div  style={{fontSize: "14px"}}>
                                            <p className='titre'>Heure d'arrivée</p>
                                            <p className='texte'>{stop.arrivalTime}</p>
                                        </div>
                                    )}
                                    {stop.departureTime && (
                                        <div  style={{fontSize: "14px"}}>
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
            </div>
        </div>
    )
}

export default SearchFeuillesDuJourCom



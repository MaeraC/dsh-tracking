

import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from "../../firebase.config"
import back from "../../assets/back.png"
import jsPDF from "jspdf";   
import html2canvas from "html2canvas"

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function FeuillesMensuelles({ uid, onReturn }) {
    const [feuillesRoute, setFeuillesRoute] = useState([]);
    const pageRef = useRef();

    useEffect(() => {
        if (!uid) return;

        const fetchFeuillesRoute = async () => {
            const feuillesRouteRef = collection(db, 'feuillesDeRoute');
            const q = query(feuillesRouteRef, where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            const feuillesRouteData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setFeuillesRoute(feuillesRouteData);
        };

        fetchFeuillesRoute();
    }, [uid]);

    const getCurrentMonthName = () => {
        const currentDate = new Date();
        return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    const groupStopsByWeek = () => {
        const weeks = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); 
        const start = new Date(currentYear, currentMonth, 1);
        const end = new Date(currentYear, currentMonth + 1, 0);
        let current = new Date(start);

        while (current <= end) {
            const weekStart = new Date(current);
            const weekEnd = new Date(current);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const stopsByDay = Array(7).fill().map(() => ({
                date: null,
                stops: [],
                motif: null
            }));

            weeks.push({
                startDate: new Date(weekStart),
                endDate: new Date(weekEnd),
                stopsByDay,
                totalKmByDay: Array(7).fill(0)
            })
            current.setDate(current.getDate() + 7);
        }

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const weekIndex = weeks.findIndex(week => date >= week.startDate && date <= week.endDate);

            if (weekIndex !== -1) {
                const dayOfWeek = date.getDay();
                weeks[weekIndex].stopsByDay[dayOfWeek].date = `${daysOfWeek[dayOfWeek]} ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`;

              
                if (feuille.isVisitsStarted === false && feuille.motif) {
                    weeks[weekIndex].stopsByDay[dayOfWeek].motif = feuille.motif;
                } else {
                    feuille?.stops?.forEach(stop => {
                        weeks[weekIndex].stopsByDay[dayOfWeek].stops.push({ ...stop });
                        weeks[weekIndex].totalKmByDay[dayOfWeek] += stop.distance || 0;
                    });
                }
            }
        });

        weeks.forEach(week => {
            week.stopsByDay.forEach((day, dayIndex) => {
                if (!day.date) {
                    const currentDay = new Date(week.startDate);
                    currentDay.setDate(currentDay.getDate() + dayIndex);
                    day.date = `${daysOfWeek[dayIndex]} ${currentDay.getDate()} ${currentDay.toLocaleDateString('fr-FR', { month: 'long' })}`;
                }
                if (day.stops.length === 0) {
                    day.stops.push(null); // Ajouter un objet vide si aucun arrêt n'est présent
                }
            });
        })
        return weeks;
    }
    const weeks = groupStopsByWeek();
    const thisMonth = getCurrentMonthName()

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    };

    const getVisitCountsForMonth = () => {
        let totalVisits = 0;
        let clientVisits = 0;
        let prospectVisits = 0;
    
        Object.values(weeks).forEach(week => {
            week.stopsByDay.forEach(day => {
                day.stops.forEach(stop => {
                    if (stop && stop.status) {
                        totalVisits++;
                        if (stop.status === "Client") {
                            clientVisits++;
                        } else if (stop.status === "Prospect") {
                            prospectVisits++;
                        }
                    }
                });
            });
        });
    
        return { totalVisits, clientVisits, prospectVisits };
    }
    const visitCounts = getVisitCountsForMonth()

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
        const input = pageRef.current;
        generatePDF(input, "feuille-mensuelle.pdf");
    }
    const handleDownloadDoc = () => {
        downloadPDF();
    }

    

    return (
        <div style={{  position: "relative" }}>
            <div className='titre-fiche'> 
                <h1>Feuille de route mensuelle</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <button onClick={handleDownloadDoc} style={{padding: "5px 20px", marginTop: "20px", marginLeft: "30px"}} className='button-colored'>Télécharger la feuille de route</button>

            <div ref={pageRef} style={{ margin: "0 20px", padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <div className='hebdo-stats-print' style={{justifyContent: "space-around"}}>
                        <p>Nombre total de visites effectuées <span>{visitCounts.totalVisits}</span></p>
                        <p>Nombre de visites clients effectuées  <span>{visitCounts.clientVisits}</span></p>
                        <p>Nombre de visites prospects effectuées  <span>{visitCounts.prospectVisits}</span></p>
                    </div>
                    <div style={{color: "grey", fontStyle: "italic", margin: "20px", textTransform: "uppercase"}}>Feuille mensuelle du mois de : {thisMonth}</div>   
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex}> 
                        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: "20px", fontSize: "15px" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '10%', background: "#3D9B9B", color: "white" }}>Total <strong>{formatDistance(week.totalKmByDay.reduce((acc, km) => acc + km, 0))}</strong></th>
                                    {week.stopsByDay.map((day, dayIndex) => (
                                        <th key={dayIndex} style={{ width: '12%', background: "#c7c7c7"}}>
                                            {daysOfWeek[dayIndex]} <br />
                                            {day.date}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: Math.max(...week.stopsByDay.map(day => day.stops.length), 0) }).map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td style={{ verticalAlign: 'top', background: "#c7c7c7" }}>
                                            <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px"}}>
                                                <strong>Nom:</strong> <br />
                                                <strong>Prosp/Clt:</strong> <br />
                                                <strong>Ville:</strong><br />
                                                <strong>Km:</strong><br />
                                                <strong>Arrivée:</strong><br />
                                                <strong>Départ:</strong>
                                            </div>
                                        </td>
                                        {week.stopsByDay.map((day, dayIndex) => (
                                            <td key={dayIndex} style={{ verticalAlign: 'top' }}>
                                                {day.stops[rowIndex] ? (
                                                    <div style={{display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "5px", height: "100%", fontSize: "14px"}}>
                                                        <p><strong>{day.stops[rowIndex].name}</strong></p><br />
                                                        <p>{day.stops[rowIndex].status}</p><br />
                                                        <p>{day.stops[rowIndex].address} {day.stops[rowIndex].postalCode} {day.stops[rowIndex].city}</p><br />
                                                        <p>{formatDistance(day.stops[rowIndex].distance)}</p><br />
                                                        <p>{day.stops[rowIndex].arrivalTime}</p><br />
                                                        <p>{day.stops[rowIndex].departureTime}</p><br />
                                                    </div>
                                                ) : (
                                                    <div style={{ height: "220px", background: "#e0e0e0", padding: "10px", textAlign: "center" }}>
                                                        { rowIndex === 0 && day.motif && (
                                                            <div>
                                                                <p style={{marginBottom: "5px"}}>Pas de déplacements</p>
                                                                <p>Motif : <strong>{day.motif}</strong></p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white"  }}>
                                        <strong>Total km</strong>
                                    </td>
                                    {week.totalKmByDay.map((km, index) => (
                                        <td key={index} style={{ verticalAlign: 'top', padding: "10px", background: "#3D9B9B", color: "white" }}>
                                            <strong>{formatDistance(km)}</strong>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeuillesMensuelles;





import React, { useEffect, useState, useRef } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from "../firebase.config"
import back from "../assets/back.png"
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

    const groupStopsByWeek = () => {
        const weeks = [];

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000);
            const dayOfWeek = date.getDay();
            const weekIndex = Math.floor((date.getDate() - 1) / 7);

            if (!weeks[weekIndex]) {
                weeks[weekIndex] = {
                    stopsByDay: Array(7).fill().map((_, index) => ({
                        date: null,
                        stops: []
                    })),
                    totalKmByDay: Array(7).fill(0)
                };
            }

            weeks[weekIndex].stopsByDay[dayOfWeek].date = `${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`;
            feuille.stops.forEach(stop => {
                weeks[weekIndex].stopsByDay[dayOfWeek].stops.push({ ...stop });
                weeks[weekIndex].totalKmByDay[dayOfWeek] += stop.distance || 0;
            });
        });

        // Ajouter les dates manquantes
        weeks.forEach(week => {
            week.stopsByDay.forEach((day, dayIndex) => {
                if (!day.date) {
                    const weekStartDate = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
                    const currentDayDate = new Date(weekStartDate.setDate(weekStartDate.getDate() + dayIndex));
                    day.date = `${currentDayDate.getDate()} ${currentDayDate.toLocaleDateString('fr-FR', { month: 'long' })}`;
                }
            });
        });

        return weeks;
    };

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance.toFixed(0)} m`;
        }
        return `${(distance / 1000).toFixed(2)} km`;
    };

    const weeks = groupStopsByWeek();

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
    };
     
    const visitCounts = getVisitCountsForMonth();

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
            const pdf = new jsPDF('l', 'mm', 'a3'); // 'l' pour landscape, 'a3' pour format A3
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
        generatePDF(input, "feuille-du-jour-hebdomadaire.pdf");
    };

    const handleDownloadDoc = () => {
        downloadPDF();
    };

    return (
        <div style={{ margin: "20px", position: "relative" }}>
            <div className='titre-fiche'> 
                <h1>Feuille de route mensuelle</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>

            <button onClick={handleDownloadDoc} className='button-colored'>Télécharger la feuille de route</button>

            <div ref={pageRef} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <div className='hebdo-stats'>
                        <p>Nombre total de visites effectuées ce mois-ci <span>{visitCounts.totalVisits}</span></p>
                        <p>Nombre de visites clients effectuées ce mois-ci <span>{visitCounts.clientVisits}</span></p>
                        <p>Nombre de visites prospects effectuées ce mois-ci <span>{visitCounts.prospectVisits}</span></p>
                    </div>
                    <div>AFFICHER LE MOIS</div>
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
                                                        <p>{day.stops[rowIndex].name}</p>
                                                        <p>{day.stops[rowIndex].status}</p>
                                                        <p>{day.stops[rowIndex].address} {day.stops[rowIndex].city}</p>
                                                        <p>{formatDistance(day.stops[rowIndex].distance)}</p>
                                                        <p>{day.stops[rowIndex].arrivalTime}</p>
                                                        <p>{day.stops[rowIndex].departureTime}</p>
                                                    </div>
                                                ) : (
                                                    <div></div> // Afficher la date si aucun arrêt n'est présent
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



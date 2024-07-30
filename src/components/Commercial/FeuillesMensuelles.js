

import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from "../../firebase.config"
import back from "../../assets/back.png"
import exportToExcel from '../ExportToExcel'

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function FeuillesMensuelles({ uid, onReturn }) {
    const [feuillesRoute, setFeuillesRoute] = useState([]);

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
        const weeks                     = []
        const currentDate               = new Date()
        const currentYear               = currentDate.getFullYear()
        const currentMonth              = currentDate.getMonth()
        const start                     = new Date(currentYear, currentMonth, 1)
        const end                       = new Date(currentYear, currentMonth + 1, 0)
        const startDayOfWeek            = start.getDay(); 
        const firstSunday               = new Date(start);

        firstSunday.setDate(start.getDate() - startDayOfWeek); 

        let current = new Date(firstSunday);
            
            while (current <= end) {
                const week = {
                    startDate: new Date(current),
                    stopsByDay: Array(7).fill().map(() => ({
                        date: null, 
                        stops: [],
                        motif: null
                    })),
                    totalKmByDay: Array(7).fill(0)
                };
    
                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const currentDay = new Date(current);
                    currentDay.setDate(currentDay.getDate() + dayIndex);
                    if (currentDay.getMonth() === current.getMonth()) {
                        week.stopsByDay[dayIndex].date = `${daysOfWeek[dayIndex]} ${currentDay.getDate()} ${currentDay.toLocaleDateString('fr-FR', { month: 'long' })}`;
                    }
                }
    
                weeks.push(week);
                current.setDate(current.getDate() + 7); 
            }
    

        feuillesRoute.forEach(feuille => {
            const date = new Date(feuille.date.seconds * 1000)
            const weekIndex = weeks.findIndex(week => date >= week.startDate && date < new Date(week.startDate).setDate(new Date(week.startDate).getDate() + 7));
    
            if (weekIndex !== -1) {
                const dayOfWeek = date.getDay();
                
                if (!weeks[weekIndex].stopsByDay[dayOfWeek].date) {
                    weeks[weekIndex].stopsByDay[dayOfWeek].date = `${daysOfWeek[dayOfWeek]} ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`;
                }
              
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
                    day.stops.push(null)
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

    const handleExport = () => {
        const feuillesData = weeks.flatMap((week, weekIndex) => {
            return week.stopsByDay.flatMap((day, dayIndex) => {

                const onlyNullStops = day.stops.every(stop => stop === null)

                if (onlyNullStops && day.motif) {
                    return [{
                        'Date': day.date || '',
                        'Visite N°': day.motif || '',
                        'Nom du salon': '',
                        'Statut': '',
                        'Adresse': '',
                        'Code postal': '',
                        'Km parcourus': 0,
                        'Heure d\'arrivée': '',
                        'Heure de départ': '',
                        'Total Distance': 0,
                        'Total Visites': 0,
                        'Visites Client': 0,
                        'Visites Prospect': 0,
                    }, {}];
                }

                const stopsData = day.stops.map((stop, idx) => ({
                    'Date': day.date || '',
                    'Visite N°': idx < day.stops.length - 1 ? `Visite n°${idx + 1}` : 'Retour',
                    'Nom du salon': stop?.name || '',
                    'Statut': stop?.status || '',
                    'Adresse': stop?.address || '', 
                    'Code postal': `${stop?.postalCode || ''}`,
                    'Km parcourus': formatDistance(stop?.distance || 0),
                    'Heure d\'arrivée': stop?.arrivalTime || '',
                    'Heure de départ': stop?.departureTime || '',
                    'Total Distance': idx === day.stops.length - 1 ? formatDistance((week.totalKmByDay && week.totalKmByDay[dayIndex]) || 0) : '',
                    'Total Visites': idx === day.stops.length - 1 ? day.stops.slice(0, -1).length : '',
                    'Visites Client': idx === day.stops.length - 1 ? day.stops.filter(s => s?.status === 'Client').length : '',
                    'Visites Prospect': idx === day.stops.length - 1 ? day.stops.filter(s => s?.status === 'Prospect').length : '',
                    
                }))

                // Inclure une ligne avec le motif si le jour n'a pas d'arrêts
                return [...stopsData, {}];
            });
        });

        const recapData = [
            ['Nombre de visites', visitCounts.totalVisits],
            ['Visites client', visitCounts.clientVisits],
            ['Visites prospect', visitCounts.prospectVisits],
        ];

        exportToExcel([].concat(feuillesData, recapData), `Feuille_${thisMonth}.xlsx`, [`Feuille_${thisMonth}`, 'Récapitulatif'], [feuillesData, recapData]);
    };

    return (
        <div style={{  position: "relative" }}>
            <div className='titre-fiche'> 
                <h1>Feuille de route mensuelle</h1>
                <button onClick={onReturn} className="button-back"><img src={back} alt="retour" /></button>
            </div>
 
            <button onClick={handleExport} style={{padding: "5px 20px", marginTop: "20px", marginLeft: "30px"}} className='button-colored'>Télécharger la feuille de route</button>

            <div style={{ margin: "0 20px", padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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
                                        <th key={dayIndex} style={{ width: '12%', background: "#c7c7c7"}}>{day.date}</th>
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
                                                                <p style={{color: "red"}}><strong>{day.motif}</strong></p>
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


